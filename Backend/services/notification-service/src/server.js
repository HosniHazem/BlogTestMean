require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { connectMongo, disconnectMongo } = require("./db");
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({
    ok: true,
    service: "notification-service",
    ts: new Date().toISOString(),
  })
);

const PORT = process.env.PORT || 4003;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*", credentials: true },
});

io.on("connection", (socket) => {
  console.log(`[notification-service] client ${socket.id} connected`);
  socket.on("disconnect", () =>
    console.log(`[notification-service] client ${socket.id} disconnected`)
  );
});

async function start() {
  try {
    await connectMongo();
    server.listen(PORT, () => {
      console.log(`[notification-service] listening on ${PORT}`);
    });
    const shutdown = async (signal) => {
      console.log(
        `[notification-service] ${signal} received, shutting down...`
      );
      server.close(async () => {
        await disconnectMongo();
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[notification-service] failed to start:", err.message);
    process.exit(1);
  }
}

start();
