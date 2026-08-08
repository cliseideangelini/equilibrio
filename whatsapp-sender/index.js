const express = require('express');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode'); // Usando a biblioteca que gera imagem
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let waSocket = null;
let isConnected = false;
let currentQR = null;
let lastConnectedAt = null;
let lastDisconnectedAt = null;

const SESSION_DIR = process.env.SESSION_DIR || 'auth_info_baileys';

// ── Backup durável da sessão (Baileys) no banco de dados do site principal ──
// O disco deste serviço não é permanente: a cada reinício/redeploy os arquivos
// de sessão local podem sumir, forçando escanear o QR code de novo. Para evitar
// isso, guardamos uma cópia dos arquivos de sessão no banco do site (via API
// protegida por segredo) e restauramos automaticamente ao iniciar.
const MAIN_APP_URL = process.env.MAIN_APP_URL || 'https://equilibrio-psi.vercel.app';
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || '';

function bridgeHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-bridge-secret': BRIDGE_SECRET,
    };
}

async function restoreSessionFromBackup() {
    if (!BRIDGE_SECRET) {
        console.log('⚠️ BRIDGE_SECRET não configurado — backup/restauração de sessão desativado.');
        return;
    }

    const credsPath = path.join(SESSION_DIR, 'creds.json');
    if (fs.existsSync(credsPath)) {
        // Já existe sessão local válida, não precisa restaurar
        return;
    }

    try {
        const res = await fetch(`${MAIN_APP_URL}/api/whatsapp-bridge/session`, {
            headers: bridgeHeaders(),
        });
        if (!res.ok) {
            console.log(`⚠️ Falha ao buscar backup de sessão (status ${res.status}). Seguindo sem restaurar.`);
            return;
        }
        const { data } = await res.json();
        if (!data) {
            console.log('ℹ️ Nenhum backup de sessão encontrado. Será necessário escanear o QR code.');
            return;
        }

        const files = JSON.parse(data);
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(SESSION_DIR, filename), content);
        }
        console.log(`✅ Sessão restaurada do backup (${Object.keys(files).length} arquivo(s)).`);
    } catch (e) {
        console.error('❌ Erro ao restaurar backup de sessão:', e.message);
    }
}

let backupInFlight = false;
async function backupSessionToRemote() {
    if (!BRIDGE_SECRET || backupInFlight) return;
    if (!fs.existsSync(SESSION_DIR)) return;

    backupInFlight = true;
    try {
        const filenames = fs.readdirSync(SESSION_DIR);
        const files = {};
        for (const filename of filenames) {
            const filePath = path.join(SESSION_DIR, filename);
            if (fs.statSync(filePath).isFile()) {
                files[filename] = fs.readFileSync(filePath, 'utf8');
            }
        }

        await fetch(`${MAIN_APP_URL}/api/whatsapp-bridge/session`, {
            method: 'PUT',
            headers: bridgeHeaders(),
            body: JSON.stringify({ data: JSON.stringify(files) }),
        });
    } catch (e) {
        console.error('❌ Erro ao enviar backup de sessão:', e.message);
    } finally {
        backupInFlight = false;
    }
}

async function clearRemoteBackup() {
    if (!BRIDGE_SECRET) return;
    try {
        await fetch(`${MAIN_APP_URL}/api/whatsapp-bridge/session`, {
            method: 'DELETE',
            headers: bridgeHeaders(),
        });
    } catch (e) {
        console.error('❌ Erro ao limpar backup remoto:', e.message);
    }
}

// ── Espaçamento mínimo entre envios ──
// Mandar várias mensagens em rajada (vários números novos em poucos minutos) é um
// padrão clássico que aciona a detecção de spam do WhatsApp e pode gerar bloqueio
// silencioso da conta (a mensagem "envia com sucesso" mas nunca chega). Isso garante
// um intervalo mínimo entre cada mensagem que o robô manda, para se comportar de
// forma mais parecida com um uso humano normal.
const MIN_SEND_INTERVAL_MS = 4000;
let lastSendAt = 0;

async function waitForSendSlot() {
    const elapsed = Date.now() - lastSendAt;
    if (elapsed < MIN_SEND_INTERVAL_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SEND_INTERVAL_MS - elapsed));
    }
    lastSendAt = Date.now();
}

// ── Fila de reenvio: mensagens que falharam por estarmos desconectados ──
async function processPendingQueue() {
    if (!isConnected || !waSocket || !BRIDGE_SECRET) return;

    try {
        const res = await fetch(`${MAIN_APP_URL}/api/whatsapp-bridge/pending`, {
            headers: bridgeHeaders(),
        });
        if (!res.ok) return;
        const { pending } = await res.json();
        if (!pending || pending.length === 0) return;

        console.log(`📤 Reenviando ${pending.length} mensagem(ns) pendente(s) da fila...`);

        for (const item of pending) {
            try {
                let cleanPhone = String(item.phone).replace(/\D/g, '');
                if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                    cleanPhone = '55' + cleanPhone;
                }
                const jid = `${cleanPhone}@s.whatsapp.net`;
                await waitForSendSlot();
                await waSocket.sendMessage(jid, { text: item.message });

                await fetch(`${MAIN_APP_URL}/api/whatsapp-bridge/pending`, {
                    method: 'PATCH',
                    headers: bridgeHeaders(),
                    body: JSON.stringify({ id: item.id, status: 'SENT' }),
                });
            } catch (sendErr) {
                await fetch(`${MAIN_APP_URL}/api/whatsapp-bridge/pending`, {
                    method: 'PATCH',
                    headers: bridgeHeaders(),
                    body: JSON.stringify({ id: item.id, status: 'PENDING', lastError: sendErr.message }),
                }).catch(() => {});
            }
        }
    } catch (e) {
        console.error('❌ Erro ao processar fila de pendentes:', e.message);
    }
}

async function connectToWhatsApp() {
    await restoreSessionFromBackup();

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const logger = pino({ level: 'silent' });

    waSocket = makeWASocket({
        version,
        auth: state,
        logger,
        printQRInTerminal: true,
        browser: ['Equilibrio Sender', 'Chrome', '1.0.0'],
        syncFullHistory: false, // Evitar travamentos por carregar histórico antigo
        generateHighQualityLinkPreview: false
    });

    waSocket.ev.on('creds.update', async () => {
        await saveCreds();
        await backupSessionToRemote();
    });

    waSocket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Gera o QR Code como uma URL base64 para o site conseguir mostrar
            currentQR = await qrcode.toDataURL(qr, { margin: 2, scale: 8 });
            isConnected = false;
            console.log('Novo QR Code gerado.');
        }

        if (connection === 'close') {
            isConnected = false;
            lastDisconnectedAt = new Date().toISOString();
            currentQR = null;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando:', shouldReconnect);

            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 2000);
            } else {
                console.log('Desconectado com sucesso.');
                waSocket = null;
                await clearRemoteBackup();
            }
        } else if (connection === 'open') {
            isConnected = true;
            lastConnectedAt = new Date().toISOString();
            currentQR = null;
            console.log('✅ WHATSAPP CONECTADO COM SUCESSO! ✅');
            await backupSessionToRemote();
            processPendingQueue();
        }
    });
}

// Verifica a fila de pendentes periodicamente (além de logo após reconectar)
setInterval(processPendingQueue, 20000);

// Liveness do processo em si (diferente do /status, que é sobre o WhatsApp)
app.get('/health', (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});

// Retorna se está conectado
app.get('/status', (req, res) => {
    res.json({ connected: isConnected, lastConnectedAt, lastDisconnectedAt });
});

// Retorna o QR code atual
app.get('/qr', (req, res) => {
    res.json({ qr: currentQR, connected: isConnected });
});

// Desconectar o WhatsApp
app.post('/logout', async (req, res) => {
    try {
        if (waSocket) {
            await waSocket.logout();
            waSocket.end(undefined);
            waSocket = null;
        }
        isConnected = false;
        currentQR = null;

        // Apaga a pasta de sessão local e o backup remoto para forçar novo QR Code
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        }
        await clearRemoteBackup();

        // Inicia novamente para gerar novo QR Code
        setTimeout(connectToWhatsApp, 1000);

        res.json({ success: true, message: 'Desconectado com sucesso!' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao desconectar', details: e.message });
    }
});

// Rota principal para enviar mensagens
app.post('/send', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ error: 'Os campos "phone" e "message" são obrigatórios.' });
        }

        if (!isConnected || !waSocket) {
            return res.status(503).json({ error: 'WhatsApp não está conectado.' });
        }

        let cleanPhone = String(phone).replace(/\D/g, '');
        if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
            cleanPhone = '55' + cleanPhone;
        }

        const jid = `${cleanPhone}@s.whatsapp.net`;
        await waitForSendSlot();
        await waSocket.sendMessage(jid, { text: message });

        res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });

    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Falha interna ao enviar mensagem', details: error.message });
    }
});

// Evita que um erro assíncrono não tratado derrube o processo inteiro sem necessidade
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de disparo rodando na porta ${PORT}`);
    connectToWhatsApp();
});
