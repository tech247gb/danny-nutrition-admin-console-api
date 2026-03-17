const DynamicFieldConfig = require('../schemas/dynamic-field-config');

const userConfig = async (req, res) => {
    try {

        const adminId = req.jwt_payload.id;
        console.log(adminId, "adminId");

        const dynamicFieldConfig = await DynamicFieldConfig.findOne({ client_id: adminId }, {
            client_id: 1,
            "config.users": 1,
            _id: 0
        });

        if (!dynamicFieldConfig || !dynamicFieldConfig.config?.users?.fields?.length) {
            return res.status(404).json({ success: true, fields: [] });
        }

        return res.status(200).json({
            success: true,
            fields: dynamicFieldConfig.config.users.fields
        });

    } catch (error) {
        console.error("userConfig error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = userConfig;