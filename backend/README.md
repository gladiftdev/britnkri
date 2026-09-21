# BritNkri Backend

## الإعداد
1. `npm install express`
2. انسخ `.env.example` لـ`.env` وعمر القيم الحقيقية
3. `node src/server.js`

## ربط WhatsApp Webhook (بعد النشر على Render)
1. Meta for Developers ← WhatsApp ← Configuration
2. Callback URL: `https://your-app.onrender.com/webhook/whatsapp`
3. Verify Token: نفس القيمة اللي حطيتي فـ`WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. اشترك (Subscribe) فـ"messages"

## بنية المجلد
```
src/
  app.js              — إعداد Express
  routes/
    whatsappWebhook.js — استقبال رسائل واتساب
    verifyPhone.js      — API للتطبيق (توليد رمز + حالة التحقق)
  services/
    whatsappVerify.js   — منطق توليد/مقارنة الرموز
```
