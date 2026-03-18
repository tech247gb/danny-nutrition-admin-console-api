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

    // ─────────────────────────────────────────────
    // Node: "Find UserId"
    // Get agent_ids from user's available_agents
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // Node: "User Primary Key"
    // Build user_pks from userId + agent_ids
    // ─────────────────────────────────────────────
    const agent_ids = userResult[0].agent_ids || [];
    const user_pks = agent_ids.map(id => `${userId}_${id}`);

    // ─────────────────────────────────────────────
    // Node: "Delete Short Context"
    // ─────────────────────────────────────────────
    await ShortTermConversationContext.deleteMany({
        user_pk: { $in: user_pks }
    });

    // ─────────────────────────────────────────────
    // Node: "Delete User Summary"
    // ─────────────────────────────────────────────
    await UserSummary.deleteMany({
        user_pk: { $in: user_pks }
    });

    // ─────────────────────────────────────────────
    // Node: "Delete Chat History"
    // ─────────────────────────────────────────────
    await ChatHistory.deleteMany({
        sessionId: { $in: user_pks }
    });

    // ─────────────────────────────────────────────
    // Node: "Delete User Info"
    // ─────────────────────────────────────────────
    const deleteUserResult = await User.deleteOne({
        $expr: {
            $eq: ["$_id", { $toObjectId: userId }]
        }
    });

    // ─────────────────────────────────────────────
    // Node: "Remove Users from Notifications"
    // Filter userId out of each notification's users array
    // ─────────────────────────────────────────────
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