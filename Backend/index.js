const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// IMPORT ROUTES
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");

dotenv.config();

const app = express();
const server = createServer(app);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= REGISTER ROUTES =================
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// ================= DEPLOYMENT =================
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}

// ================= SOCKET.IO SETUP =================
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined chat room: ${roomId}`);
  });

  socket.on("typing", (roomId) => {
    socket.in(roomId).emit("typing");
  });

  socket.on("stop typing", (roomId) => {
    socket.in(roomId).emit("stop typing");
  });
  socket.on("removed from group", ({ chatId, userId }) => {
    socket.in(userId).emit("removed from group", chatId);
  });

  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat;
    if (!chat.users) {
      console.log("Chat.users not defined for message:", newMessage);
      return;
    }
    chat.users.forEach((user) => {
      if (user._id.toString() === newMessage.sender._id.toString()) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ================= DATABASE CONNECTION =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

// ================= START SERVER =================
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
