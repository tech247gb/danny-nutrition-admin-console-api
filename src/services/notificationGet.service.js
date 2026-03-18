// services/notificationService.js
const Notification = require('../schemas/notifications');
const User = require('../schemas/users');

const listNotificationsService = async (clientId) => {

    const totalUsersResult = await User.aggregate([
        { $match: { client_id: clientId } },
        { $count: "totalUsers" }
    ]);
    const totalUsers = totalUsersResult[0]?.totalUsers ?? 0;


    const notifications = await Notification.find({ client_id: clientId });


    const notificationList = notifications.map((notification) => {
        const doc = notification.toObject();
        const userListLength = doc.users ? doc.users.length : 0;

        if (userListLength === totalUsers) {
            doc.users = ['all_users'];
        }

        return doc;
    });

    return notificationList;
};

module.exports = { listNotificationsService };