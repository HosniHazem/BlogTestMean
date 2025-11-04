const mongoose = require("mongoose");
const Article = require("../models/Article.model");
const Comment = require("../models/Comment.model");
const Notification = require("../models/Notification.model");
const User = require("../models/User.model");
const cache = require("../config/cache");

// Helper function to create notification
const createNotification = async (
  io,
  recipientId,
  type,
  title,
  message,
  relatedData = {}
) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      ...relatedData,
      link: relatedData.link || `/articles/${relatedData.relatedArticle}`,
    });

    // Emit real-time notification
    if (io) {
      io.to(`user:${recipientId}`).emit("notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// @desc    Get all articles
// @route   GET /api/articles
const getAllArticles = async (req, res) => {
  try {
    // Best-effort auth: if optional auth didn't attach user, try here
    if (
      !req.user &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      try {
        const jwt = require("jsonwebtoken");
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
        }
      } catch (_) {
        // ignore token errors in optional context
      }
    }

    const {
      page = 1,
      limit = 10,
      status,
      category,
      tag,
      author,
      search,
    } = req.query;
    const query = {};

    // Readers and unauthenticated users can only see published articles
    if (req.user?.role === "READER" || !req.user) {
      query.status = "PUBLISHED";
    } else if (status) {
      // Authenticated ADMIN/EDITOR/AUTHOR can filter by status
      const validStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
      const upperStatus = status.toUpperCase();
      if (validStatuses.includes(upperStatus)) {
        query.status = upperStatus;
      }
    }
    // If authenticated ADMIN/EDITOR/AUTHOR and no status filter, show all statuses

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Cache key includes role and query params
    const paramsHash = Buffer.from(
      JSON.stringify({
        role: req.user?.role || "PUBLIC",
        page,
        limit,
        status: query.status || "ALL",
        category: category || "",
        tag: tag || "",
        author: author || "",
        search: search || "",
      })
    ).toString("base64url");

    if (cache.isReady && cache.isReady()) {
      const cached = await cache.get(cache.listKey(paramsHash));
      if (cached) return res.json(JSON.parse(cached));
    }

    const articles = await Article.find(query)
      .populate("author", "username avatar")
      .populate("commentsCount")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1, createdAt: -1 });

    const total = await Article.countDocuments(query);

    const response = {
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    if (cache.isReady && cache.isReady()) {
      await cache.set(cache.listKey(paramsHash), JSON.stringify(response), 30);
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Get article by ID or slug
// @route   GET /api/articles/:id
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    if (cache.isReady && cache.isReady()) {
      const cached = await cache.get(cache.detailKey(id));
      if (cached) return res.json(JSON.parse(cached));
    }

    const article = await Article.findOne(query)
      .populate("author", "username avatar bio")
      .populate({
        path: "comments",
        match: { isDeleted: false, parentComment: null },
        populate: {
          path: "author",
          select: "username avatar",
        },
        options: { sort: { createdAt: -1 } },
      })
      .populate("commentsCount");

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article non trouvé" });
    }

    // Check permissions for draft/archived articles
    if (article.status !== "PUBLISHED") {
      if (
        !req.user ||
        (req.user.role !== "ADMIN" &&
          req.user.role !== "EDITOR" &&
          article.author._id.toString() !== req.user._id.toString())
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Accès refusé" });
      }
    }

    // Increment views for published articles
    if (article.status === "PUBLISHED") {
      article.views += 1;
      await article.save();
    }

    const response = { success: true, data: { article } };
    if (cache.isReady && cache.isReady()) {
      await cache.set(cache.detailKey(id), JSON.stringify(response), 60);
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Create article
// @route   POST /api/articles
const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, tags, category, status } =
      req.body;

    // Only AUTHOR, EDITOR, ADMIN can create articles
    if (!["AUTHOR", "EDITOR", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const article = await Article.create({
      title,
      content,
      excerpt,
      featuredImage,
      tags: tags || [],
      category: category || "General",
      status: status || "DRAFT",
      author: req.user._id,
    });

    const populatedArticle = await Article.findById(article._id).populate(
      "author",
      "username avatar"
    );

    // Notification if published
    if (status === "PUBLISHED" && req.app.get("io")) {
      // Notify followers or all users (optional)
    }

    // Invalidate list caches
    if (cache.isReady && cache.isReady()) {
      await cache.flushArticles();
    }

    res.status(201).json({
      success: true,
      message: "Article créé avec succès",
      data: { article: populatedArticle },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article non trouvé" });
    }

    // Check permissions
    if (!req.user.canEditArticle(article)) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const { title, content, excerpt, featuredImage, tags, category, status } =
      req.body;

    if (title) article.title = title;
    if (content) article.content = content;
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (featuredImage) article.featuredImage = featuredImage;
    if (tags) article.tags = tags;
    if (category) article.category = category;
    if (status) {
      const validStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
      const upperStatus = status.toUpperCase();
      if (validStatuses.includes(upperStatus)) {
        article.status = upperStatus;
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Statut invalide. Valeurs autorisées: DRAFT, PUBLISHED, ARCHIVED",
        });
      }
    }
    article.lastModifiedBy = req.user._id;

    await article.save();

    const updatedArticle = await Article.findById(id).populate(
      "author",
      "username avatar"
    );

    if (cache.isReady && cache.isReady()) {
      await cache.flushArticle(id);
      await cache.flushArticles();
    }

    res.json({
      success: true,
      message: "Article mis à jour",
      data: { article: updatedArticle },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article non trouvé" });
    }

    // Only ADMIN can delete articles
    if (!req.user.canDeleteArticle(article)) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    // Delete associated comments
    await Comment.deleteMany({ article: id });
    await Article.findByIdAndDelete(id);

    if (cache.isReady && cache.isReady()) {
      await cache.flushArticle(id);
      await cache.flushArticles();
    }

    res.json({ success: true, message: "Article supprimé" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Like/Unlike article
// @route   POST /api/articles/:id/like
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article non trouvé" });
    }

    const userId = req.user._id;
    const isLiked = article.likes.includes(userId);

    if (isLiked) {
      article.likes = article.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      article.likes.push(userId);

      // Create notification for author
      if (
        article.author.toString() !== userId.toString() &&
        req.app.get("io")
      ) {
        await createNotification(
          req.app.get("io"),
          article.author,
          "ARTICLE_LIKE",
          "Nouveau like",
          `${req.user.username} a aimé votre article "${article.title}"`,
          { relatedArticle: article._id, relatedUser: userId }
        );
      }
    }

    await article.save();

    res.json({
      success: true,
      message: isLiked ? "Like retiré" : "Article aimé",
      data: { likesCount: article.likes.length, isLiked: !isLiked },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
};
