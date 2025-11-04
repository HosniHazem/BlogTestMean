const User = require("../models/User.model");
const Article = require("../models/Article.model");

// @desc    Get all users (Admin only)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "articlesCount",
        select: "title status publishedAt",
      });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
  }
};

// @desc    Update user (self or Admin)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, bio, avatar, socialLinks } = req.body;

    // Vérifier les permissions
    if (id !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Seul l'admin peut changer le rôle
    if (req.body.role && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Seul un admin peut modifier le rôle",
        });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (req.body.role && req.user.role === "ADMIN")
      updateData.role = req.body.role;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Utilisateur mis à jour",
      data: { user: updatedUser },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vous ne pouvez pas supprimer votre propre compte",
        });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Optionnel : désactiver au lieu de supprimer
    if (req.query.soft === "true") {
      user.isActive = false;
      await user.save();
      return res.json({ success: true, message: "Utilisateur désactivé" });
    }

    await User.findByIdAndDelete(id);
    res.json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
  }
};

// @desc    Get user's articles
// @route   GET /api/users/:id/articles
const getUserArticles = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { author: id };
    if (status) query.status = status;
    if (req.user._id.toString() !== id && req.user.role !== "ADMIN") {
      query.status = "PUBLISHED";
    }

    const articles = await Article.find(query)
      .populate("author", "username avatar")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Article.countDocuments(query);

    res.json({
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
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserArticles,
};
