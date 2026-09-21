// Webhook استقبال رسائل واتساب — هادي النقطة اللي Meta كيبعث ليها كل رسالة جات
// من الزبناء. الاستقبال مجاني بالكامل عبر WhatsApp Cloud API.

const express = require("express");
const router = express.Router();
const { verifyIncomingMessage } = require("../services/whatsappVerify");

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

// 1) Meta كيبعث GET مرة وحدة بس، وقت ما كتربط الـwebhook لأول مرة (Handshake)
router.get("/webhook/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2) هنا كيجي كل رسالة حقيقية بعتها زبون
router.post("/webhook/whatsapp", (req, res) => {
  // خاص نرد 200 فورا (Meta كيعاود المحاولة إلا تأخرنا)
  res.sendStatus(200);

  (async () => {
    try {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      if (!message || message.type !== "text") return;

      const fromPhone = message.from;
      const text = message.text.body;

      const result = await verifyIncomingMessage(fromPhone, text);
      console.log(`WhatsApp verify from ${fromPhone}:`, result);
    } catch (err) {
      console.error("WhatsApp webhook error:", err);
    }
  })();
});

module.exports = router;
