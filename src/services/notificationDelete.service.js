
const Notification = require('../schemas/notifications');
const mongoose = require('mongoose');

const removeNotificationService = async (_id) => {
    const result = await Notification.deleteOne({
        _id: new mongoose.Types.ObjectId(_id)
    });
    return result.deletedCount;
};

module.exports = { removeNotificationService };