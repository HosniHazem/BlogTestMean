require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { connectMongo, disconnectMongo } = require("./db");
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Health
app.get("/health", (req, res) =>
  res.json({ ok: true, service: "user-service", ts: new Date().toISOString() })
);

// Stubs (to migrate):
app.post("/auth/login", (req, res) =>
  res.status(501).json({
    success: false,
    message: "Not implemented - migrate from monolith",
  })
);
app.post("/auth/register", (req, res) =>
  res.status(501).json({ success: false })
);
app.post("/auth/refresh-token", (req, res) =>
  res.status(501).json({ success: false })
);
app.post("/auth/logout", (req, res) =>
  res.status(501).json({ success: false })
);
app.get("/users/:id", (req, res) => res.status(501).json({ success: false }));

const PORT = process.env.PORT || 4001;

async function start() {
  try {
    await connectMongo();
    const server = app.listen(PORT, () => {
      console.log(`[user-service] listening on ${PORT}`);
    });
    const shutdown = async (signal) => {
      console.log(`[user-service] ${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectMongo();
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[user-service] failed to start:", err.message);
    process.exit(1);
  }
}

start();
