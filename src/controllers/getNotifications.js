// controllers/listNotifications.js
const { listNotificationsService } = require('../services/notificationGet.service');

const getNotifications = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;
        console.log("clientId", clientId);

        const notificationList = await listNotificationsService(clientId);

        return res.status(200).json({
            success: true,
            notificationList
        });

    } catch (error) {
        console.error("getNotifications error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = getNotifications;