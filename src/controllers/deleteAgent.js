const { deleteAgentService } = require('../services/agentDelete.service');

const deleteAgent = async (req, res) => {
    try {
        const { _id } = req.body;

        const result = await deleteAgentService(_id);

        return res.status(result.status).json(result.response);

    } catch (error) {
        console.error("deleteAgent error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }

};

module.exports = deleteAgent;