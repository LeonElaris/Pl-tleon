// server.js — Leon Mongo Diagnos
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

let mongoStatus = { connected: false, error: null, uriSet: !!process.env.MONGO_URI };

// 1) Starta upp & försök koppla Mongo
(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI saknas i Environment");
    await mongoose.connect(process.env.MONGO_URI);
    mongoStatus.connected = true;
    console.log("✅ Mongo connected");
  } catch (err) {
    mongoStatus.connected = false;
    mongoStatus.error = err.message || String(err);
    console.error("❌ Mongo error:", mongoStatus.error);
  }
})();

// 2) Rutter för snabb koll
app.get('/', (_req, res) => res.type('text').send('🗝️ Leon diagnosserver live. Kolla /health och /ping.'));
app.get('/ping', async (_req, res) => {
  try {
    if (!mongoose.connection.db) throw new Error("Ingen DB-connection");
    await mongoose.connection.db.admin().ping();
    return res.json({ pong: true, mongo: true });
  } catch (e) {
    return res.json({ pong: true, mongo: false, error: e.message });
  }
});
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    mongo: mongoStatus.connected,
    uriSet: mongoStatus.uriSet,
    error: mongoStatus.error || null
  });
});

// 3) Starta
app.listen(PORT, () => console.log(`🔥 Diagnosserver på port ${PORT}`));
