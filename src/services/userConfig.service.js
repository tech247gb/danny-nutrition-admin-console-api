const DynamicFieldConfig = require('../schemas/dynamic-field-config');

const getUserConfigService = async (adminId) => {
    if (!adminId) {
        throw { status: 400, message: "Admin id is required" };
    }

    const dynamicFieldConfig = await DynamicFieldConfig.findOne(
        { client_id: adminId },
        {
            client_id: 1,
            "config.users": 1,
            _id: 0
        }
    ).lean();

    const fields = dynamicFieldConfig?.config?.users?.fields || [];

    return fields;
};

module.exports = {
    getUserConfigService
};