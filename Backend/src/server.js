require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/database");
const { initializeSocket } = require("./sockets/socket.handler");
const cache = require("./config/cache");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = initializeSocket(server);
app.set("io", io);

const startServer = async () => {
  try {
    await connectDB();
    await cache.init();

    server.listen(PORT, () => {
      console.log("╔════════════════════════════════════════╗");
      console.log(`║  🚀 Serveur démarré sur le port ${PORT}  ║`);
      console.log(`║  🌍 Environnement: ${process.env.NODE_ENV}       ║`);
      console.log(`║  📡 API: http://localhost:${PORT}/api    ║`);
      console.log(`║  🔌 WebSocket: ws://localhost:${PORT}    ║`);
      if (cache.isReady && cache.isReady()) {
        console.log("║  🧠 Cache: Redis connecté                 ║");
      } else {
        console.log("║  🧠 Cache: désactivé                      ║");
      }
      console.log("╚════════════════════════════════════════╝");
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM reçu, arrêt du serveur...");
  server.close(() => {
    console.log("🔌 Serveur HTTP fermé");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT reçu, arrêt du serveur...");
  server.close(() => {
    console.log("🔌 Serveur HTTP fermé");
    process.exit(0);
  });
});

startServer();
