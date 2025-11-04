const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    createdByIp: {
      type: String,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedByIp: {
      type: String,
    },
    replacedByToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revokedAt && this.expiresAt > new Date();
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
