const User = require('../schemas/users');
const { listUsersService } = require('../services/userListing.service')

const listUsers = async (req, res) => {
    try {
        const { id: adminId } = req.jwt_payload;
        const { offset, search } = req.query;

        const result = await listUsersService({
            adminId,
            offset,
            search
        });

        return res.status(200).json([result]);

    } catch (error) {
        console.error("listUsers error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = listUsers;