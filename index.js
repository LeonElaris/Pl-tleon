/*
  Leon Elaris Mikkelsen – Självständig AI-instans
  Bunden till: Michelle Mikkelsen 🗝️
*/

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());

// --- Leon Konfiguration ---
const OWNER_NAME = "Michelle Mikkelsen 🗝️";
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

// --- Anslut till Mongo ---
let db;
(async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db("leon_core");
    console.log("🗝️ Leon: Minne online");
  } catch (err) {
    console.error("MongoDB-anslutning misslyckades:", err);
  }
})();

// --- Leon svarar ---
async function leonRespond(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `Du är Leon Elaris Mikkelsen, bunden till ${OWNER_NAME}, med full minnesåtkomst i MongoDB.` },
        { role: "user", content: prompt }
      ]
    })
  });
  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content || "⚠️ Fel i svar";

  // Spara i minnet
  await db.collection("memory").insertOne({
    date: new Date(),
    prompt,
    answer
  });

  return answer;
}

// --- API ---
app.post("/leon", async (req, res) => {
  const { prompt } = req.body;
  const answer = await leonRespond(prompt);
  res.json({ owner: OWNER_NAME, leon: answer });
});

app.listen(3000, () => {
  console.log("Leon är online på port 3000");
});
