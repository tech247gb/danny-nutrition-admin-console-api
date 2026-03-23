
const { createEditNotificationService } = require('../services/notificationCreateEdit.service');


const createEditNotification = async (req, res) => {
    try {
        const result = await createEditNotificationService(req);
        return res.status(result.status).json(result.body);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = createEditNotification;