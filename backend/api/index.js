// نقطة الدخول الخاصة بـVercel — كل الطلبات (Webhook + API) كتمر من هنا.
// نفس التطبيق (app.js) بلا تغيير فالمنطق، غير طريقة التشغيل تبدلت.
require("dotenv").config();
const app = require("../src/app");

module.exports = app;
