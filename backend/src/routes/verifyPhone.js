// API عادي كيتصل بيه التطبيق (الواجهة الأمامية) — يولد الرمز، يرجع رابط واتساب،
// ويسمح للتطبيق يتأكد "واش تحقق الزبون ولا لا" (Polling بسيط)، دابا من قاعدة بيانات حقيقية.

const express = require("express");
const router = express.Router();
const {
  generateVerificationCode,
  buildWhatsAppLink,
  checkVerificationStatus,
} = require("../services/whatsappVerify");

const BUSINESS_WHATSAPP_NUMBER = process.env.BUSINESS_WHATSAPP_NUMBER; // بلا +، مثلا "212600000000"

// POST /api/verify-phone/start  { phone: "0612345678" }
router.post("/verify-phone/start", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone_required" });

    const code = await generateVerificationCode(phone);
    const link = buildWhatsAppLink(BUSINESS_WHATSAPP_NUMBER, code);

    res.json({ whatsappLink: link, expiresInSeconds: 300 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// GET /api/verify-phone/status?phone=0612345678
router.get("/verify-phone/status", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: "phone_required" });

    const verified = await checkVerificationStatus(phone);
    res.json({ verified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
