const phone = "5511999999999";
const message = "Teste de envio";
fetch("https://equilibrio-production.up.railway.app/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message })
}).then(async r => {
    console.log("Status:", r.status);
    console.log("Body:", await r.text());
}).catch(console.error);
