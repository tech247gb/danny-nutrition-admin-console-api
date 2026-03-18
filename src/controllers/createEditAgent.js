const { createEditAgentService } = require('../services/agentEditAdd.service');

const createEditAgent = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("QUERY:", req.query);
        const result = await createEditAgentService(
            req.body,
            req.query,
            req.jwt_payload
        );

        return res.status(result.status).json(result.response);

    } catch (error) {
        console.error("createEditAgent error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = createEditAgent;