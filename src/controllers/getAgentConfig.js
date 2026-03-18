// controllers/getAgentConfig.js
const { getAgentConfigService } = require('../services/agentConfigGet.service');

const getAgentConfig = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;
        const { configType } = req.params;
        const agent_types = req.body.agent_types || [];


        if (configType !== "users" && configType !== "files") {
            return res.status(400).json({
                success: false,
                message: "Unknown Config Type"
            });
        }

        const agent_config = await getAgentConfigService(clientId, configType, agent_types);

        return res.status(200).json({
            success: true,
            agent_config
        });

    } catch (error) {
        console.error("getAgentConfig error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = getAgentConfig;