const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema({
    template_name: String,
    template_id: String,
    channel: String,
    enable: Boolean,
    client_id: String,
    has_parameters: Boolean,

}, // <--- End of definition object
    { // <--- Start of options object
        collection: "notification_templates",
        strict: false,
        strictQuery: false
    });

module.exports = mongoose.model("NotificationTemplate", notificationTemplateSchema, "notification_templates");
