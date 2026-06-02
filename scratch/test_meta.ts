import { notifyPatient } from "../src/lib/whatsapp";
import * as fs from "fs";
import * as path from "path";

// Manually load .env variables if not loaded
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
    console.log("Starting WhatsApp Meta API check...");
    console.log("WHATSAPP_PHONE_NUMBER_ID:", process.env.WHATSAPP_PHONE_NUMBER_ID);
    console.log("TOKEN LENGTH:", process.env.WHATSAPP_ACCESS_TOKEN?.length);

    try {
        console.log("Testing with number format: +55 19 98942-8861");
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const phone = "5519989428861";
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
                to: phone,
                type: "template",
                template: {
                    name: "hello_world",
                    language: {
                        code: "en_US" // hello_world is usually en_US
                    }
                }
            })
        });

        console.log("Status:", response.status);
        console.log("Body:", await response.text());
    } catch (e: any) {
        console.error("Fetch failed detailed error:", e);
    }
}

run().catch(console.error);
