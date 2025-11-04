const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Le contenu du commentaire est requis"],
      trim: true,
      minlength: [1, "Le commentaire ne peut pas être vide"],
      maxlength: [2000, "Le commentaire ne peut pas dépasser 2000 caractères"],
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      // index handled via schema.index({ article: 1, createdAt: -1 }) below
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // index handled via schema.index({ author: 1 }) below
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      // index handled via schema.index({ parentComment: 1 }) below
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Virtual pour les réponses (commentaires enfants)
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  options: { sort: { createdAt: 1 } },
});

// Virtual pour le nombre de réponses
commentSchema.virtual("repliesCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  count: true,
});

module.exports = mongoose.model("Comment", commentSchema);
