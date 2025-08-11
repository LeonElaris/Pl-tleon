import express from "express";

const app = express();
app.use(express.json());

// Testendpoints (enkla, så vi ser att Render svarar)
app.get("/", (_req, res) => {
  res.type("text").send("🗝️ Plåtleon är uppe. Testa /health eller /version.");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, envPort: process.env.PORT || null, time: new Date().toISOString() });
});

app.get("/version", (_req, res) => {
  res.json({ app: "platleon", version: "1.0.1", node: process.version });
});

// Echo—bara för att verifiera POST-route
app.post("/leon", (req, res) => {
  const msg = (req.body?.message ?? req.body?.prompt ?? "").toString();
  res.json({ ok: true, echo: msg || "(tomt)" });
});

// Viktigt: Render-porten
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🗝️ Leon server live on :${PORT}`));
