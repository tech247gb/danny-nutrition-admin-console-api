const Agent = require('../schemas/agents');

const listAgentsService = async (clientId) => {
    if (!clientId) {
        throw { status: 401, message: "Unauthorized" };
    }

    const agents = await Agent.find({ client_id: clientId }).lean();

    return agents;
};

module.exports = {
    listAgentsService
};