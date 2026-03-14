const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Chat Page
 */
exports.chatPage = async (req, res) => {
  const currentUserId = req.session.user._id.toString();
  const receiverId = req.params.userId ? req.params.userId.toString() : "";

  const conversationId =
    receiverId && receiverId !== currentUserId
      ? currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`
      : "";

  // Build contact list from message history (so /chat works too)
  const recentMessages = await Message.find({
    $or: [{ sender: currentUserId }, { receiver: currentUserId }],
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const otherUserIds = Array.from(
    new Set(
      recentMessages
        .map((m) =>
          m.sender.toString() === currentUserId
            ? m.receiver.toString()
            : m.sender.toString()
        )
        .filter(Boolean)
    )
  );

  const contacts =
    otherUserIds.length > 0
      ? await User.find({ _id: { $in: otherUserIds } })
          .select("_id name role")
          .lean()
      : [];

  res.render("student/chat", {
    pageCSS: "chat.css",
    conversationId,
    receiverId,
    currentUserId,
    contacts,
  });
};

/**
 * Send Message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res
        .status(400)
        .json({ error: "Receiver and message are required" });
    }

    const senderId = req.session.user._id.toString();
    const receiverIdStr = receiverId.toString();
    const conversationId =
      senderId < receiverIdStr
        ? `${senderId}_${receiverIdStr}`
        : `${receiverIdStr}_${senderId}`;

    await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverIdStr,
      message,
    });

    res.status(200).json({ success: "Message sent", conversationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending message" });
  }
};

/**
 * Fetch Conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "name email")
      .lean();
    res.json(messages || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching messages" });
  }
};