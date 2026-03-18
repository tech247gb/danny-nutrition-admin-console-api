const AgentType = require('../schemas/agent_types');

const listAgentTypesService = async () => {
    const agentTypes = await AgentType.find(
        { enabled: true },
        { name: 1, type: 1, _id: 0 }
    )
        .lean();

    return agentTypes;
};

module.exports = {
    listAgentTypesService
};