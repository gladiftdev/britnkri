const express = require("express");
const app = express();

app.use(express.json());

app.use("/", require("./routes/whatsappWebhook")); // للمستقبل
app.use("/api", require("./routes/verifyPhone"));   // للمستقبل
app.use("/api", require("./routes/bookings"));
app.use("/api", require("./routes/cars"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;
