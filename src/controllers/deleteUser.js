const User = require('../schemas/users');
const ShortTermConversationContext = require('../schemas/short-term-conversation-context');
const UserSummary = require('../schemas/user-summary');
const ChatHistory = require('../schemas/chat-history');
const Notification = require('../schemas/notifications');
const mongoose = require('mongoose');

const deleteUser = async (req, res) => {
    try {


        const { userId } = req.body;
        const clientId = req.jwt_payload.id;

        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    _id: 0,
                    agent_ids: "$available_agents.agent_id"
                }
            }
        ];
        const userResult = await User.aggregate(pipeline);
        console.log(userResult, "userResult");

        const agent_ids = userResult[0]?.agent_ids || [];
        console.log("agent_id", agent_ids);

        const user_pks = agent_ids.map((agentId) => `${userId}_${agentId}`);

        console.log("userpks", user_pks);

        const shortTermConversationContextResult = await ShortTermConversationContext.deleteOne({
            "user_pk": { "$in": user_pks }
        });

        const result = await UserSummary.deleteOne({
            "user_pk": { "$in": user_pks }
        });

        const chatHistoryResult = await ChatHistory.deleteOne({
            "sessionId": { "$in": user_pks }
        });



        const deleteUserResult = await User.deleteOne({
            _id: new mongoose.Types.ObjectId(userId)
        });

        const deleteCount = deleteUserResult.deletedCount;

        const pipeline_2 = [
            {
                "$match": { "users": { "$in": [userId] } }
            },
            {
                "$set": {
                    "users": {
                        "$filter": {
                            "input": "$users",
                            "as": "u",
                            "cond": { "$ne": ["$$u", userId] }
                        }
                    }
                }
            },
            {
                "$merge": {
                    "into": "notifications", // Ensure this matches your collection name
                    "whenMatched": "merge"
                }
            }
        ];

        await Notification.aggregate(pipeline_2);


        if (deleteCount > 0) {
            return res.json({
                success: 1,
                userId: userId
            });
        } else {
            return res.json({
                success: 0
            });
        }


    } catch (error) {
        console.error("deleteUser error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = deleteUser;