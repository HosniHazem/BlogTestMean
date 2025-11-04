const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// ====================================
// MIDDLEWARES DE SÉCURITÉ
// ====================================

// Helmet - Sécurise les headers HTTP
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? {
            useDefaults: true,
            directives: {
              defaultSrc: ["'self'"],
              baseUri: ["'self'"],
              fontSrc: ["'self'", "https:", "data:"],
              imgSrc: ["'self'", "data:"],
              objectSrc: ["'none'"],
              scriptSrc: ["'self'"],
              scriptSrcAttr: ["'none'"],
              styleSrc: ["'self'", "https:"],
              upgradeInsecureRequests: [],
            },
          }
        : undefined,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  })
);

// CORS - Configuration pour Angular
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    maxAge: 600,
  })
);

// Body parser - DOIT être AVANT mongo-sanitize
app.use(
  express.json({
    limit: "10mb",
    strict: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Protection contre injection MongoDB - APRÈS body parser
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// Protection XSS
app.use(xss());

// Protection contre HTTP Parameter Pollution
app.use(hpp());

// Rate Limiting - Protection contre DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict login lockout (per IP)
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_MAX_ATTEMPTS) || 5,
  message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Per-route write limits
const writeLimiter = rateLimit({
  windowMs: parseInt(process.env.WRITE_WINDOW_MS) || 60 * 1000,
  max: parseInt(process.env.WRITE_MAX_PER_MINUTE) || 30,
  message: "Trop d'opérations d'écriture, ralentissez.",
  standardHeaders: true,
  legacyHeaders: false,
});

const commentWriteLimiter = rateLimit({
  windowMs: parseInt(process.env.COMMENT_WINDOW_MS) || 60 * 1000,
  max: parseInt(process.env.COMMENT_MAX_PER_MINUTE) || 20,
  message: "Trop de commentaires, ralentissez.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
// Apply write limiters per resource base path
app.use(["/api/articles", "/api/comments"], writeLimiter);

// ====================================
// SWAGGER DOCUMENTATION
// ====================================
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Serve static files for custom Swagger UI enhancements (must be before Swagger setup)
// Serve from root to match the customJs path
app.use(
  express.static(path.join(__dirname, "../public"), {
    index: false,
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .btn.authorize {
        display: inline-block !important;
        background-color: #49cc90 !important;
        border-color: #49cc90 !important;
        color: white !important;
      }
      .swagger-ui .btn.authorize:hover {
        background-color: #37a169 !important;
      }
      .auth-helper {
        margin-bottom: 20px;
      }
    `,
    customSiteTitle: "Blog Platform API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "list",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
    },
    customJs: "/custom-swagger.js",
  })
);

// ====================================
// ROUTES
// ====================================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API en ligne",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Import des routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const articleRoutes = require("./routes/article.routes");
const commentRoutes = require("./routes/comment.routes");
const notificationRoutes = require("./routes/notification.routes");

// Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// ====================================
// GESTION DES ERREURS
// ====================================

// Route non trouvée
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  // Handle JSON parsing errors specifically
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format. Please check your request body syntax.",
      error: err.message,
      hint: "Common issues: missing quotes around strings, missing commas, trailing commas, or unclosed strings",
    });
  }

  // Handle other JSON parsing errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format. Please check your request body syntax.",
      error: err.message,
      hint: "Ensure all strings are properly quoted and closed, and all brackets/braces are balanced",
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Erreur:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Erreur serveur",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
