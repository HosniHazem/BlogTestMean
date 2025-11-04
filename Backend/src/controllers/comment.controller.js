const Comment = require("../models/Comment.model");
const Article = require("../models/Article.model");
const Notification = require("../models/Notification.model");

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

    if (io) {
      io.to(`user:${recipientId}`).emit("notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// @desc    Get comments for an article
// @route   GET /api/comments/article/:articleId
const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const comments = await Comment.find({
      article: articleId,
      isDeleted: false,
      parentComment: null,
    })
      .populate("author", "username avatar")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: {
          path: "author",
          select: "username avatar",
        },
        options: { sort: { createdAt: 1 } },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Comment.countDocuments({
      article: articleId,
      isDeleted: false,
      parentComment: null,
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Get comment by ID
// @route   GET /api/comments/:id
const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("author", "username avatar")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: {
          path: "author",
          select: "username avatar",
        },
      });

    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Commentaire non trouvé" });
    }

    res.json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Create comment
// @route   POST /api/comments
const createComment = async (req, res) => {
  try {
    const { content, articleId, parentCommentId } = req.body;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article non trouvé" });
    }

    // Verify parent comment if replying
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "Commentaire parent non trouvé" });
      }
    }

    const comment = await Comment.create({
      content,
      article: articleId,
      author: req.user._id,
      parentComment: parentCommentId || null,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "username avatar"
    );

    // Real-time emit to article room and notify author room
    const io = req.app.get("io");
    if (io) {
      io.to(`article:${articleId}`).emit("comment:new", populatedComment);
    }

    // Create notifications
    if (parentCommentId) {
      // Notify parent comment author
      const parentComment = await Comment.findById(parentCommentId).populate(
        "author"
      );
      if (parentComment.author._id.toString() !== req.user._id.toString()) {
        await createNotification(
          io,
          parentComment.author._id,
          "REPLY",
          "Nouvelle réponse",
          `${req.user.username} a répondu à votre commentaire`,
          {
            relatedArticle: articleId,
            relatedComment: comment._id,
            relatedUser: req.user._id,
          }
        );
      }
    } else {
      // Notify article author
      if (article.author.toString() !== req.user._id.toString()) {
        await createNotification(
          io,
          article.author,
          "COMMENT",
          "Nouveau commentaire",
          `${req.user.username} a commenté votre article "${article.title}"`,
          {
            relatedArticle: articleId,
            relatedComment: comment._id,
            relatedUser: req.user._id,
          }
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Commentaire créé",
      data: { comment: populatedComment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Commentaire non trouvé" });
    }

    // Check permissions: author can edit own comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(id).populate(
      "author",
      "username avatar"
    );

    // Real-time emit to article room
    const io = req.app.get("io");
    if (io) {
      io.to(`article:${updatedComment.article}`).emit(
        "comment:update",
        updatedComment
      );
    }

    res.json({
      success: true,
      message: "Commentaire mis à jour",
      data: { comment: updatedComment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Delete comment (soft delete)
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Commentaire non trouvé" });
    }

    // Check permissions: author or admin
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    comment.isDeleted = true;
    await comment.save();

    // Real-time emit to article room
    const io = req.app.get("io");
    if (io) {
      io.to(`article:${comment.article}`).emit("comment:delete", { id });
    }

    res.json({ success: true, message: "Commentaire supprimé" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Commentaire non trouvé" });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      comment.likes.push(userId);

      // Create notification for comment author
      const io = req.app.get("io");
      if (comment.author.toString() !== userId.toString() && io) {
        await createNotification(
          io,
          comment.author,
          "COMMENT_LIKE",
          "Nouveau like",
          `${req.user.username} a aimé votre commentaire`,
          {
            relatedArticle: comment.article,
            relatedComment: comment._id,
            relatedUser: userId,
          }
        );
      }
    }

    await comment.save();

    // Real-time emit to article room
    const io = req.app.get("io");
    if (io) {
      io.to(`article:${comment.article}`).emit("comment:like", {
        id,
        likesCount: comment.likes.length,
      });
    }

    res.json({
      success: true,
      message: isLiked ? "Like retiré" : "Commentaire aimé",
      data: { likesCount: comment.likes.length, isLiked: !isLiked },
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
  getArticleComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
};
