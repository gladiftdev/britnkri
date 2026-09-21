// عميل Supabase للسيرفر (Backend) — كيستعمل service_role، كيتخطى RLS بالكامل.
// ماخاصهش يستعمل حتى فالواجهة الأمامية أبدا — سري 100%.

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

module.exports = supabase;
