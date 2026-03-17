const Agent = require('../schemas/agents');
const mongoose = require("mongoose");

const listAgents = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;
        const agents = await Agent.find({ client_id: clientId });
        return res.status(200).json({
            success: true,
            agentList: agents
        });


    } catch (error) {
        console.error("deleteAgent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

module.exports = listAgents;    