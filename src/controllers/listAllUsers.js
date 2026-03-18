const { listAllUsersService } = require('../services/userAllListing.service');

const listAllUsers = async (req, res) => {
    try {
        const { id: adminId } = req.jwt_payload;

        const users = await listAllUsersService(adminId);

        return res.status(200).json({
            success: true,
            userData: users
        });

    } catch (error) {
        console.error("listAllUsers error:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = listAllUsers;