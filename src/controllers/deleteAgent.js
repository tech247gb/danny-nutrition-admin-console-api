const Agent = require('../schemas/agents');
const mongoose = require("mongoose");

const deleteAgent = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Missing notification id"
            });
        }
        const deleteAgentResult = await Agent.deleteOne({
            _id: new mongoose.Types.ObjectId(_id)
        });
        const deleteCount = deleteAgentResult.deletedCount;
        if (deleteCount > 0) {
            return res.status(200).json({
                success: true,
                id: _id
            });
        } else {
            return res.status(400).json({
                success: false
            });
        }



    } catch (error) {
        console.error("deleteAgent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

module.exports = deleteAgent;