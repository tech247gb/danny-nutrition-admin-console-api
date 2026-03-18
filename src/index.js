require("dotenv").config(); // 1. Load this FIRST
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config"); // Assuming your URI logic is here
const routes = require("./routes");
const documentRoutes = require("./routes/documentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/usersRoutes");
const agentsRoutes = require("./routes/agentsRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3001; // 2. Use logical OR (||)

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/api", routes); // Best practice: prefix your routes
app.use("/api/documents", documentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/auth", authRoutes);

// --- Database Connection ---
// 3. Use a function to handle connection logic and errors
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 4. Exit process with failure if DB fails
  }
};

// Start the server ONLY after trying to connect to DB
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});