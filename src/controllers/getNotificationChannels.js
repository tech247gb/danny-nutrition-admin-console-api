const { getNotificationChannelsService } = require('../services/notificationChannelsGet.service');

const getNotificationChannels = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;

        const channelList = await getNotificationChannelsService(clientId);

        return res.status(200).json({
            success: true,
            channelList
        });

    } catch (error) {
        console.error("getNotificationChannels error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = getNotificationChannels;