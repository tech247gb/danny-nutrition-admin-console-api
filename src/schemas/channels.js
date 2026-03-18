const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    name: String,
    channel: String,
    client_id: String,
    sender_id: String,

});

module.exports = mongoose.model("Channel", channelSchema, "channels");