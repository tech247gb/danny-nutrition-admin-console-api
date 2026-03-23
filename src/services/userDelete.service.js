const User = require('../schemas/users');
const ShortTermConversationContext = require('../schemas/short-term-conversation-context');
const UserSummary = require('../schemas/user-summary');
const ChatHistory = require('../schemas/chat-history');
const Notification = require('../schemas/notifications');
const mongoose = require('mongoose');

const deleteUserService = async (userId) => {

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw { status: 400, message: "Invalid or missing userId" };
    }


    const userResult = await User.aggregate([
        {
            $match: {
                $expr: {
                    $eq: ["$_id", { $toObjectId: userId }]
                }
            }
        },
        {
            $project: {
                agent_ids: "$available_agents.agent_id"
            }
        }
    ]);

    if (!userResult || userResult.length === 0) {
        throw { status: 404, message: "User not found" };
    }


    const agent_ids = userResult[0].agent_ids || [];
    const user_pks = agent_ids.map(id => `${userId}_${id}`);


    await ShortTermConversationContext.deleteMany({
        user_pk: { $in: user_pks }
    });

    await UserSummary.deleteMany({
        user_pk: { $in: user_pks }
    });


    await ChatHistory.deleteMany({
        sessionId: { $in: user_pks }
    });


    const deleteUserResult = await User.deleteOne({
        $expr: {
            $eq: ["$_id", { $toObjectId: userId }]
        }
    });


    await Notification.aggregate([
        {
            $match: { users: { $in: [userId] } }
        },
        {
            $set: {
                users: {
                    $filter: {
                        input: "$users",
                        as: "u",
                        cond: { $ne: ["$$u", userId] }
                    }
                }
            }
        },
        {
            $merge: {
                into: "notifications",
                whenMatched: "merge"
            }
        }
    ]);

    return deleteUserResult.deletedCount;
};

module.exports = { deleteUserService };