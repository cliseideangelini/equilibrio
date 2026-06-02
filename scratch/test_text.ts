import * as fs from "fs";
import * as path from "path";

const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
        const parts = line.split("=");
        if (parts.length === 2) {
            process.env[parts[0].trim()] = parts[1].trim();
        }
    });
}

async function run() {
    console.log("Sending FREE-FORM TEXT to WhatsApp Meta API...");
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const phone = "5519989428861"; // The original verified number with the 9
    const apiUrl = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    
    console.log("Fetching url:", apiUrl);
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "text",
            text: {
                preview_url: false,
                body: "Olá! Esta é uma mensagem de texto simples enviada via API, para testar se a janela de 24 horas está aberta corretamente."
            }
        })
    });

    console.log("Status:", response.status);
    console.log("Body:", await response.text());
}

run().catch(console.error);
