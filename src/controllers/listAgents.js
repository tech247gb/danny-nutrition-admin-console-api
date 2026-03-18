const { listAgentsService } = require('../services/agentList.service');

const listAgents = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;

        const agents = await listAgentsService(clientId);

        return res.status(200).json({
            success: true,
            agentList: agents
        });

    } catch (error) {
        console.error("listAgents error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }

};

module.exports = listAgents;    