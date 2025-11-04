const Notification = require("../models/Notification.model");

// @desc    Get user notifications
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { recipient: req.user._id };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("relatedArticle", "title slug")
      .populate("relatedComment", "content")
      .populate("relatedUser", "username avatar")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
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

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification non trouvée" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "Notification marquée comme lue",
      data: { notification },
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

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "Toutes les notifications ont été marquées comme lues",
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

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification non trouvée" });
    }

    await Notification.findByIdAndDelete(id);

    res.json({ success: true, message: "Notification supprimée" });
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

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ success: true, data: { count } });
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
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};


