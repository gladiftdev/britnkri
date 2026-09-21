// API عادي كيتصل بيه التطبيق (الواجهة الأمامية) — يولد الرمز، يرجع رابط واتساب،
// ويسمح للتطبيق يتأكد "واش تحقق الزبون ولا لا" (Polling بسيط).

const express = require("express");
const router = express.Router();
const {
  generateVerificationCode,
  buildWhatsAppLink,
  normalizePhone,
} = require("../services/whatsappVerify");

const BUSINESS_WHATSAPP_NUMBER = process.env.BUSINESS_WHATSAPP_NUMBER; // بلا +، مثلا "212600000000"

// POST /api/verify-phone/start  { phone: "0612345678" }
router.post("/verify-phone/start", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone_required" });

  const code = generateVerificationCode(phone);
  const link = buildWhatsAppLink(BUSINESS_WHATSAPP_NUMBER, code);

  res.json({ whatsappLink: link, expiresInSeconds: 300 });
});

// GET /api/verify-phone/status?phone=0612345678
// التطبيق كيسولها كل 2-3 ثواني بعد ما الزبون يدوس "إرسال" فواتساب
router.get("/verify-phone/status", (req, res) => {
  const { phone } = req.query;
  // TODO: تبدل هادشي بقراءة حقيقية من قاعدة البيانات (جدول bookings أو verifications)
  // هنا غير مثال توضيحي للشكل اللي خاص الجواب يكون بيه
  res.json({ verified: false }); // أو true إلا تأكد الرمز فالـwebhook
});

module.exports = router;
