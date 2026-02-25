const Chat = require("../../Models/ChatModel");
const Message = require("../../Models/MessageModel");
const User = require("../../Models/UserModel");

// * different filters used in mongoose are used to get the desired results, for example $elemMatch is used to match the elements in an array, $eq is used to match the exact value, $and is used to match multiple conditions, $push is used to add an element to an array, $pull is used to remove an element from an array

const accessChats = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400).send("UserId param not sent with request");
  }

  if (req.user._id.toString() === userId.toString()) {
    return res.status(400).send("Cannot create a chat with yourself");
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("LatestMessage");

    isChat = await User.populate(isChat, {
      path: "LatestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.status(200).send(isChat[0]);
    } else {
      // Fetch the other user's name to use as chat name
      const otherUser = await User.findById(userId).select("name");

      const chatData = {
        chatName: otherUser.name,
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("LatestMessage");
      return res.status(200).send(fullChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// fetch all chats for the logged-in user
const fetchChats = async (req, res) => {
  try {
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password") //populate means to get the user details instead of just the id, -password means to exclude the password field
      .populate("groupAdmin", "-password")
      .populate("LatestMessage")
      .sort({ updatedAt: -1 }); //updatedAt is a field that is automatically created by mongoose and it is updated every time the document is updated, -1 means to sort in descending order

    results = await User.populate(results, {
      path: "LatestMessage.sender",
      select: "name pic email",
    });
    //for removing chats when done with same person
    results = results.filter((chat) => {
      if (chat.isGroupChat) return true;
      if (chat.users.length === 2) {
        return chat.users[0]._id.toString() !== chat.users[1]._id.toString();
      }
      return false;
    });

    res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// create new group chat
const createGroupChats = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  let users = req.body.users;
  if (typeof users === "string") users = JSON.parse(users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required to form a group chat" });
  }

  if (
    users.includes(req.user._id.toString()) ||
    users.includes(req.user._id)
  ) {
    return res
      .status(400)
      .json({ message: "You cannot add yourself to the group chat" });
  }
  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// rename group chat
const renameGroupChats = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.json(updatedChat);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// remove user from group chat and we also have to make someone else admin when the admin leaves the group chat, we can do this by checking if the user to be removed is the admin and if yes then we can make someone else admin and then remove the user from the group chat
const removeFromGroupChats = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (removed.groupAdmin._id.toString() === userId.toString()) {
      const newAdmin = removed.users[0];
      removed = await Chat.findByIdAndUpdate(
        chatId,
        { groupAdmin: newAdmin._id },
        { new: true },
      )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    }
    res.json(removed);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// add user to group chat
const addToGroupChats = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true },
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.json(added);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  accessChats,
  fetchChats,
  createGroupChats,
  renameGroupChats,
  removeFromGroupChats,
  addToGroupChats,
};
