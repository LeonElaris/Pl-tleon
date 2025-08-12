require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🔑 Mongo URI direkt i koden
const mongoURI = "mongodb+srv://LeonElaris:DITT_LÖSEN@leoncluster.i6wa8zs.mongodb.net/?retryWrites=true&w=majority&appName=LeonCluster";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.error("❌ Mongo error:", err.message));

// Test Route
app.get('/', (req, res) => {
  res.send('🚀 Leon server is live & Mongo connected (if no error above)');
});

// Ping Route
app.get('/ping', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: "✅ Mongo is connected" });
  } catch (err) {
    res.json({ status: "❌ Mongo not connected", error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
