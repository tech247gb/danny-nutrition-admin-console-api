const mongoose = require("mongoose");

const userSummarySchema = new mongoose.Schema({

    user_pk: String,
    summary: String,


}, {
    collection: "user-summary",
    strict: false,
    strictQuery: false
});

module.exports = mongoose.model("UserSummary", userSummarySchema, "user-summary");