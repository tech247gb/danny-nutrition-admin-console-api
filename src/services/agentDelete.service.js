const Agent = require('../schemas/agents');
const mongoose = require("mongoose");

const deleteAgentService = async (_id) => {
    if (!_id || !_id.trim()) {
        return {
            status: 500,
            response: {
                success: false,
                message: "Missing notification id"
            }
        };
    }

    const deleteResult = await Agent.deleteOne({
        _id: new mongoose.Types.ObjectId(_id)
    });

    if (deleteResult.deletedCount > 0) {
        return {
            status: 200,
            response: {
                success: true,
                id: _id
            }
        };
    } else {
        return {
            status: 200,
            response: {
                success: false
            }
        };
    }
};

module.exports = {
    deleteAgentService
};