const mongoose = require("mongoose");

const shortTermConversationContextSchema = new mongoose.Schema({
    user_pk: String,
    agent_id: String,
    client_id: String,
    context: String

}, {
    collection: "short-term-conversation-context",
    strict: false,
    strictQuery: false
});

module.exports = mongoose.model("ShortTermConversationContext", shortTermConversationContextSchema, "short-term-conversation-context");