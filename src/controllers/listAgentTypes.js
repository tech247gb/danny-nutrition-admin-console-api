const AgentType = require('../schemas/agent_types');

const listAgentTypes = async (req, res) => {
    try {
        const agentTypes = await AgentType.find({}, {
            name: 1,
            type: 1
        });
        return res.status(200).json({
            success: true,
            agentTypes: agentTypes
        });
    } catch (error) {
        console.error("listAgentTypes error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = listAgentTypes;
