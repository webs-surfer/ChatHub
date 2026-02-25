const Message = require("../../Models/MessageModel");
const Chat = require("../../Models/ChatModel");
const User = require("../../Models/UserModel");

// Get all messages for a chat
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Invalid data passed into request" });
    }

    let message = await Message.create({
      sender: req.user._id,
      content: content,
      chat: chatId,
    });

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update the chat's latest message
    await Chat.findByIdAndUpdate(
      chatId,
      { LatestMessage: message },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { allMessages, sendMessage };
