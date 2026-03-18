// services/agentService.js
const Agent = require('../schemas/agents');
const AgentType = require('../schemas/agent_types');

const getAgentConfigService = async (clientId, configType, agent_types) => {

    let agents = [];

    if (agent_types.length > 0) {
        agents = agent_types.map(type => ({ type, _id: null, name: null }));

    } else {
        const agentResult = await Agent.find(
            { client_id: clientId },
            { type: 1, _id: 1, name: 1 }
        );
        agents = agentResult;
    }

    const resolved_agent_types = agents.map(agent => agent.type);

    const agentTypeResult = await AgentType.find(
        { type: { $in: resolved_agent_types } },
        { [`config.${configType}.fields`]: 1, type: 1, _id: 0 }
    );

    const configMap = {};
    for (const agentType of agentTypeResult) {
        configMap[agentType.type] = agentType.config?.[configType]?.fields ?? null;
    }
    const agent_config = agents.map(agent => ({
        agent_id: agent._id,
        name: agent.name,
        type: agent.type,
        config: configMap[agent.type] ?? null
    }));

    return agent_config;
};

module.exports = { getAgentConfigService };