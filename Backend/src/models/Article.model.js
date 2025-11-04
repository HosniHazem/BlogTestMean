const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      minlength: [3, "Le titre doit contenir au moins 3 caractères"],
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu est requis"],
      minlength: [50, "Le contenu doit contenir au moins 50 caractères"],
    },
    excerpt: {
      type: String,
      maxlength: [500, "L'extrait ne peut pas dépasser 500 caractères"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // index handled via schema.index({ author: 1, status: 1 }) below
    },
    featuredImage: {
      type: String,
      default: "https://via.placeholder.com/800x400",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      // index handled via composite indexes below
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    publishedAt: {
      type: Date,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure slug exists before validation runs
articleSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Indexes pour optimisation
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ publishedAt: -1 });

// Virtual pour les commentaires
articleSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "article",
  options: { sort: { createdAt: -1 } },
});

// Virtual pour le nombre de commentaires
articleSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "article",
  count: true,
});

// Middleware pre-save : Générer le slug et publishedAt
articleSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  // Set publishedAt when status changes to PUBLISHED
  if (this.isModified("status")) {
    if (this.status === "PUBLISHED" && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status !== "PUBLISHED" && this.publishedAt) {
      // Optionally keep publishedAt even if status changes back to DRAFT
      // Uncomment the next line if you want to clear publishedAt when status changes from PUBLISHED
      // this.publishedAt = undefined;
    }
  }
  next();
});

module.exports = mongoose.model("Article", articleSchema);
