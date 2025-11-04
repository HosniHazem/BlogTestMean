const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectedUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:4200",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token manquant"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Authentication error: Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connecté: ${socket.id}`);
    connectedUsers.set(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);

    // Rooms for articles: join to receive live comments/likes
    socket.on("article:join", (articleId) => {
      if (articleId) {
        socket.join(`article:${articleId}`);
      }
    });

    socket.on("article:leave", (articleId) => {
      if (articleId) {
        socket.leave(`article:${articleId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client déconnecté: ${socket.id}`);
      connectedUsers.delete(socket.userId);
    });
  });

  console.log("🔌 Socket.io initialisé");
  return io;
};

module.exports = { initializeSocket };
