// خدمة "التحقق المعكوس عبر واتساب" — دابا كتخزن فجدول phone_verifications
// الحقيقي فقاعدة البيانات، بدل الـMap المؤقتة اللي كانت كتضيع عند إعادة التشغيل.

const crypto = require("crypto");
const supabase = require("../lib/supabaseClient");

const CODE_TTL_MS = 5 * 60 * 1000; // 5 دقايق صلاحية

function normalizePhone(phone) {
  return phone.replace(/\D/g, "").replace(/^212/, "0").replace(/^0/, "");
}

function buildWhatsAppLink(businessPhone, code) {
  const text = encodeURIComponent(`التحقق: ${code}`);
  return `https://wa.me/${businessPhone}?text=${text}`;
}

// كتولد رمز جديد وتخزنو فقاعدة البيانات
async function generateVerificationCode(phone) {
  const code = crypto.randomInt(1000, 9999).toString();
  const normalized = normalizePhone(phone);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { error } = await supabase
    .from("phone_verifications")
    .insert({ phone: normalized, code, expires_at: expiresAt, verified: false });

  if (error) throw new Error(`فشل تخزين رمز التحقق: ${error.message}`);
  return code;
}

// كتستدعى من الـwebhook ملي توصل رسالة جديدة من واتساب
async function verifyIncomingMessage(fromPhone, messageText) {
  const normalized = normalizePhone(fromPhone);

  // كنجيبو آخر رمز مازال صالح لهاد الرقم
  const { data, error } = await supabase
    .from("phone_verifications")
    .select("id, code, expires_at, verified")
    .eq("phone", normalized)
    .eq("verified", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`خطأ فقراءة رمز التحقق: ${error.message}`);
  if (!data) return { verified: false, reason: "no_pending_code" };

  const matches = messageText.includes(data.code);
  if (matches) {
    await supabase.from("phone_verifications").update({ verified: true }).eq("id", data.id);
  }
  return { verified: matches, reason: matches ? "ok" : "code_mismatch" };
}

// كتستعمل من الـAPI (verifyPhone.js) باش تشوف واش الزبون تحقق ولا لا
async function checkVerificationStatus(phone) {
  const normalized = normalizePhone(phone);
  const { data, error } = await supabase
    .from("phone_verifications")
    .select("verified")
    .eq("phone", normalized)
    .eq("verified", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`خطأ فقراءة حالة التحقق: ${error.message}`);
  return !!data;
}

module.exports = {
  generateVerificationCode,
  buildWhatsAppLink,
  verifyIncomingMessage,
  checkVerificationStatus,
  normalizePhone,
};
