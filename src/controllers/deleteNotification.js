// controllers/deleteNotification.js
const { removeNotificationService } = require('../services/notificationDelete.service');

const deleteNotification = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id || _id.trim() === "") {
            return res.status(500).json({
                success: 0,
                message: "Missing notification id"
            });
        }

        const deletedCount = await removeNotificationService(_id);

        if (deletedCount > 0) {
            return res.status(200).json({
                success: true,
                id: _id
            });
        } else {
            return res.status(200).json({
                success: false
            });
        }

    } catch (error) {
        console.error("deleteNotification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = deleteNotification;