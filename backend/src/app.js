const express = require("express");
const app = express();

app.use(express.json());

app.use("/", require("./routes/whatsappWebhook"));
app.use("/api", require("./routes/verifyPhone"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = app;
