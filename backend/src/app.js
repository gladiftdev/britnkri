const express = require("express");
const app = express();

app.use(express.json());

app.use("/", require("./routes/whatsappWebhook")); // خلينا الكود، للمستقبل
app.use("/api", require("./routes/verifyPhone"));   // خلينا الكود، للمستقبل
app.use("/api", require("./routes/bookings"));       // الطريق الفعلي دابا

app.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;
