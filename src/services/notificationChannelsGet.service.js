const Channel = require('../schemas/channels');

const getNotificationChannelsService = async (clientId) => {
    if (!clientId) {
        throw { status: 400, message: "Client id is required" };
    }

    const channelList = await Channel.find(
        { client_id: clientId },
        { name: 1, channel: 1, client_id: 1, sender_id: 1, _id: 0 }
    );

    return channelList;
};

module.exports = {
    getNotificationChannelsService
};