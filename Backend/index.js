const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { chats } = require("./data/data");
const DbConnect = require("./config/db");
const router = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", router);

app.use(notFound);
app.use(errorHandler);

// Start server ONLY after DB connection
const startServer = async () => {
  try {
    await DbConnect();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
  }
};

startServer();
