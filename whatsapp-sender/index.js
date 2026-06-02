const express = require('express');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode'); // Usando a biblioteca que gera imagem
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let waSocket = null;
let isConnected = false;
let currentQR = null;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();
    
    const logger = pino({ level: 'silent' });

    waSocket = makeWASocket({
        version,
        auth: state,
        logger,
        printQRInTerminal: true,
        browser: ['Equilibrio Sender', 'Chrome', '1.0.0']
    });

    waSocket.ev.on('creds.update', saveCreds);

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
            currentQR = null;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando:', shouldReconnect);
            
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 2000);
            } else {
                console.log('Desconectado com sucesso.');
                waSocket = null;
            }
        } else if (connection === 'open') {
            isConnected = true;
            currentQR = null;
            console.log('✅ WHATSAPP CONECTADO COM SUCESSO! ✅');
        }
    });
}

// Retorna se está conectado
app.get('/status', (req, res) => {
    res.json({ connected: isConnected });
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
        
        // Apaga a pasta de sessão para forçar novo QR Code
        if (fs.existsSync('auth_info_baileys')) {
            fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        }
        
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
        await waSocket.sendMessage(jid, { text: message });
        
        res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });

    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Falha interna ao enviar mensagem', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de disparo rodando na porta ${PORT}`);
    connectToWhatsApp();
});
