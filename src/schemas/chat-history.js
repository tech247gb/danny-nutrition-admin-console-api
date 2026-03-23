const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema({
    sessionId: String,
    messages: Array

});

module.exports = mongoose.model("ChatHistory", chatHistorySchema, "chat-history");