const { getUserConfigService } = require('../services/userConfig.service');

const userConfig = async (req, res) => {
    try {
        const adminId = req.jwt_payload.id;

        const fields = await getUserConfigService(adminId);

        if (!fields.length) {
            return res.status(404).json({
                success: true,
                fields: []
            });
        }

        return res.status(200).json({
            success: true,
            fields
        });

    } catch (error) {
        console.error("userConfig error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = userConfig;