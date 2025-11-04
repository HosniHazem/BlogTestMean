require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { connectMongo, disconnectMongo } = require("./db");
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({
    ok: true,
    service: "article-service",
    ts: new Date().toISOString(),
  })
);

// Stubs to migrate from monolith
app.get("/articles", (req, res) => res.status(501).json({ success: false }));
app.get("/articles/:id", (req, res) =>
  res.status(501).json({ success: false })
);
app.post("/articles", (req, res) => res.status(501).json({ success: false }));
app.put("/articles/:id", (req, res) =>
  res.status(501).json({ success: false })
);
app.delete("/articles/:id", (req, res) =>
  res.status(501).json({ success: false })
);

app.post("/comments", (req, res) => res.status(501).json({ success: false }));
app.put("/comments/:id", (req, res) =>
  res.status(501).json({ success: false })
);
app.delete("/comments/:id", (req, res) =>
  res.status(501).json({ success: false })
);

const PORT = process.env.PORT || 4002;

async function start() {
  try {
    await connectMongo();
    const server = app.listen(PORT, () => {
      console.log(`[article-service] listening on ${PORT}`);
    });
    const shutdown = async (signal) => {
      console.log(`[article-service] ${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectMongo();
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[article-service] failed to start:", err.message);
    process.exit(1);
  }
}

start();
