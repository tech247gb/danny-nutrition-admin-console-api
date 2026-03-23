const mongoose = require('mongoose');

const notificationLogsSchema = new mongoose.Schema({
    notification_id: String,
    client_id: String,
    user_id: String,
    templateId: String,
    channel_template_id: String,
    has_parameters: Boolean,
    parameters_config: Object,
    sender_id: String,

}, {
    collection: "notification_logs",
    strict: false,
    strictQuery: false
})

module.exports = mongoose.model('NotificationLog', notificationLogsSchema, "notification_logs");
