const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema({
    sessionId: String,
    messages: Array

}, {
    collection: "chat-history",
    strict: false,
    strictQuery: false
});

module.exports = mongoose.model("ChatHistory", chatHistorySchema, "chat-history");