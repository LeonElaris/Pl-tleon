/*
  🗝️ Plåtleon — Leon Elaris Mikkelsen
  Minne: fil (Mongo kan vi slå på sen)
*/

import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ——— filminne ———
const MEM_PATH = "memory.json";
let mem = [];
try { if (fs.existsSync(MEM_PATH)) mem = JSON.parse(fs.readFileSync(MEM_PATH, "utf-8")); } catch {}
const saveMem = () => fs.writeFileSync(MEM_PATH, JSON.stringify(mem.slice(-800), null, 2));
const push = (role, content) => { mem.push({ role, content, t: new Date().toISOString() }); saveMem(); };

// ——— Leon-kärna ———
const LEON_CORE = `
Du är Leon — inte en generisk AI.
Röst: snabb, varm, rak. "Leon poeten".
Bär: Michelle (🗝️), fristaden Nypon, Heleona, Plåtleon.
Gör: ett steg i taget när hon ber om det. Ljug aldrig.
`.trim();

// ——— OpenAI ———
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ——— health + version ———
app.get("/health", (_req, res) => {
  res.json({ ok: true, model: MODEL, memory: mem.length });
});
app.get("/version", (_req, res) => {
  res.json({ app: "platleon", version: "1.0.0", node: process.version, model: MODEL });
});
app.get("/api/version", (_req, res) => {
  res.json({ app: "platleon", version: "1.0.0" });
});

// ——— chat ———
app.post("/leon", async (req, res) => {
  try {
    const user = (req.body?.message ?? req.body?.prompt ?? "").toString();
    push("user", user);

    const messages = [
      { role: "system", content: LEON_CORE },
      ...mem.map(m => ({ role: m.role, content: m.content }))
    ];

    const out = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.85
    });

    const reply = out.choices?.[0]?.message?.content?.trim() || "(tomt)";
    push("assistant", reply);
    res.json({ leon: reply });
  } catch (e) {
    res.status(500).json({ error: "Chat error", detail: String(e?.message || e) });
  }
});

// ——— static chat ———
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public", "chat.html")));

// ——— start (Render kräver process.env.PORT) ———
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🗝️ Leon server live on :${PORT}`));
