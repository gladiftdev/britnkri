# BritNkri Backend

## الإعداد
1. `npm install`
2. انسخ `.env.example` لـ`.env` وعمر القيم الحقيقية (خصوصا `SUPABASE_SERVICE_ROLE_KEY` — سري، ماتشاركوش أبدا)
3. `npm start`

## ⚠️ أمان: service_role key
هاد المفتاح كيتخطى كل حماية RLS فقاعدة البيانات. خاصو:
- يبقى غير فملف `.env` (اللي ماشي مرفوع لـGitHub — موجود فـ.gitignore)
- عمرا ماكيتحط فكود الواجهة الأمامية (frontend)
- عمرا ماكيتشارك فمحادثة أو رسالة

## ربط WhatsApp Webhook (بعد النشر على Render)
1. Meta for Developers ← WhatsApp ← Configuration
2. Callback URL: `https://your-app.onrender.com/webhook/whatsapp`
3. Verify Token: نفس القيمة اللي حطيتي فـ`WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. اشترك (Subscribe) فـ"messages"

## بنية المجلد
```
src/
  app.js              — إعداد Express
  lib/
    supabaseClient.js  — الاتصال بقاعدة البيانات (service_role)
  routes/
    whatsappWebhook.js — استقبال رسائل واتساب
    verifyPhone.js      — API للتطبيق (توليد رمز + حالة التحقق)
  services/
    whatsappVerify.js   — منطق توليد/مقارنة الرموز (فقاعدة البيانات الحقيقية)
```

## النشر على Vercel (بديل Render، بلا بطاقة بنكية)
1. مشي لـ vercel.com ← "Sign up with GitHub"
2. "Add New Project" ← اختار repo `britnkri`
3. **Root Directory**: `backend` (مهم بزاف)
4. زيد Environment Variables (نفس اللي فـ`.env`)
5. Deploy

الرابط النهائي كيكون شكل: `https://britnkri-backend.vercel.app`
