const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    name: String,
    status: String,
    trigger_type: String,

}, // <--- End of definition object
    { // <--- Start of options object
        collection: "notifications",
        strict: false,
        strictQuery: false
    });

module.exports = mongoose.model("Notification", notificationSchema, "notifications");