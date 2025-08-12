require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Mongo ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.error("❌ Mongo error:", err.message));

// --- Twilio (initiera bara om allt finns) ---
let twilioClient = null;
let twilioStatus = { enabled: false, reason: "not_configured" };

(() => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) {
    console.log("ℹ️ Twilio disabled (missing env vars).");
    return; // låt servern köra vidare
  }
  try {
    twilioClient = require('twilio')(sid, token);
    twilioStatus = { enabled: true, from };
    console.log("✅ Twilio ready");
  } catch (e) {
    twilioClient = null;
    twilioStatus = { enabled: false, reason: e.message || "init_error" };
    console.log("⚠️ Twilio init error:", twilioStatus.reason);
  }
})();

// --- Routes ---
app.get('/', (_req, res) => res.send('🚀 Leon server live'));

app.get('/ping', async (_req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ ok: true, mongo: true });
  } catch (e) {
    res.json({ ok: true, mongo: false, error: e.message });
  }
});

app.get('/health', (_req, res) => {
  const mongoOK = mongoose.connection.readyState === 1;
  res.json({ ok: true, mongo: mongoOK, twilio: twilioStatus });
});

app.post('/send-sms', async (req, res) => {
  if (!twilioClient || !twilioStatus.enabled) {
    return res.status(503).json({ ok: false, error: "Twilio not configured" });
  }
  try {
    const { to, text } = req.body;
    const msg = await twilioClient.messages.create({
      body: text,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    res.json({ ok: true, sid: msg.sid });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Start ---
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
