// controllers/getNotificationTemplates.js
const { fetchNotificationTemplatesService } = require('../services/notificationTemplate.service');

const getNotificationTemplates = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;

        const templateList = await fetchNotificationTemplatesService(clientId);

        return res.status(200).json({
            success: true,
            templateList
        });

    } catch (error) {
        console.error("getNotificationTemplates error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = getNotificationTemplates;