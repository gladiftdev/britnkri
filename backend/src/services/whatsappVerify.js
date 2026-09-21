// خدمة "التحقق المعكوس عبر واتساب" — بلا أي تكلفة إرسال، حيت الزبون هو اللي كيبعث،
// ماشي احنا. الاستقبال عبر WhatsApp Cloud API مجاني بالكامل، بلا حد على العدد.

const crypto = require("crypto");

// تخزين مؤقت للرموز (فالإنتاج الحقيقي: استعمل Redis أو جدول فقاعدة البيانات
// بدل هاد الـMap، حيت هادي كتضيع إلا عاود السيرفر التشغيل)
const pendingCodes = new Map(); // phone -> { code, expiresAt }

const CODE_TTL_MS = 5 * 60 * 1000; // 5 دقايق صلاحية

function generateVerificationCode(phone) {
  const code = crypto.randomInt(1000, 9999).toString(); // رمز 4 أرقام
  pendingCodes.set(normalizePhone(phone), {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  });
  return code;
}

function buildWhatsAppLink(businessPhone, code) {
  const text = encodeURIComponent(`التحقق: ${code}`);
  return `https://wa.me/${businessPhone}?text=${text}`;
}

function normalizePhone(phone) {
  // كيحيد كلشي غير الأرقام، باش "0612345678" و"+212612345678" يتقارنو صح
  return phone.replace(/\D/g, "").replace(/^212/, "0").replace(/^0/, "");
}

// كتستدعى من الـwebhook ملي توصل رسالة جديدة من واتساب
function verifyIncomingMessage(fromPhone, messageText) {
  const normalized = normalizePhone(fromPhone);
  const pending = pendingCodes.get(normalized);
  if (!pending) return { verified: false, reason: "no_pending_code" };
  if (Date.now() > pending.expiresAt) {
    pendingCodes.delete(normalized);
    return { verified: false, reason: "expired" };
  }
  const matches = messageText.includes(pending.code);
  if (matches) pendingCodes.delete(normalized); // رمز يستعمل مرة وحدة بس
  return { verified: matches, reason: matches ? "ok" : "code_mismatch" };
}

module.exports = { generateVerificationCode, buildWhatsAppLink, verifyIncomingMessage, normalizePhone };
