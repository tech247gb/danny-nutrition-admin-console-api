
const NotificationTemplate = require('../schemas/notification_templates');

const fetchNotificationTemplatesService = async (clientId) => {
    const templateList = await NotificationTemplate.find(
        { client_id: clientId, enable: true },
        {
            template_name: 1,
            template_id: 1,
            channel: 1,
            has_parameters: 1,
            parameters_config: 1,
            _id: 0
        }
    );
    return templateList;
};

module.exports = { fetchNotificationTemplatesService };