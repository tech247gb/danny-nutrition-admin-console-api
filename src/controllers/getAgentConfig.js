const Agent = require('../schemas/agents');
const AgentType = require('../schemas/agent_types');

const getAgentConfig = async (req, res) => {
    try {
        const agent_types = req.body.agentic_types || [];
        const { configType } = req.params;
        const clientId = req.jwt_payload.id;

        if (configType === "users" || configType === "files") {

            // ✅ Fixed: declare at outer scope so both branches can write to it
            let resolved_agent_types = [];
            let agents = []

            if (agent_types.length > 0) {
                // ✅ Fixed: assign to outer variable, not a new const
                resolved_agent_types = agent_types;

            } else {
                // ✅ Fixed: fetch from DB and assign to outer variable
                const agentResult = await Agent.find(
                    { client_id: clientId },
                    { type: 1, _id: 1, name: 1 }
                );

                agents = agentResult;


            }

            resolved_agent_types = agents.map((agent) => agent.type);
            console.log("resolved_agent_types", resolved_agent_types)

            // ✅ Now resolved_agent_types is accessible here
            const agentTypeResult = await AgentType.find(
                { type: { $in: resolved_agent_types } },
                { [`config.${configType}.fields`]: 1, type: 1, _id: 1 }
            );
            console.log("agentTypeResult", agentTypeResult);


            // // ✅ Fixed: build configMap so response has actual data
            const configMap = {};
            for (let agent of agentTypeResult) {
                configMap[agent.type] = agent.config?.[configType]?.fields || null;
            }

            const datares = agents.map((agent) => {
                return {
                    agent_id: agent._id,
                    name: agent.name,
                    type: agent.type,
                    config: configMap[agent.type]
                }
            })
            console.log("datares", datares)





            return res.status(200).json({
                success: true,
                agent_config: datares
            });

        } else {
            return res.status(400).json({
                success: 0,
                message: "Unknown Config Type"
            });
        }

    } catch (error) {
        console.error("getAgentConfig error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = getAgentConfig;