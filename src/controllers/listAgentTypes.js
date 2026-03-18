const { listAgentTypesService } = require('../services/agentTypes.service');


const listAgentTypes = async (req, res) => {
    try {
        const agentTypes = await listAgentTypesService();

        return res.status(200).json({
            success: true,
            agentTypes
        });

    } catch (error) {
        console.error("listAgentTypes error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = listAgentTypes;
