const User = require('../schemas/users');

const listAllUsers = async (req, res) => {
    try {
        const { id } = req.jwt_payload;
        const adminId = id;

        const users = await User.find({ client_id: adminId }, {
            _id: 1,
            name: 1,
        });
        return res.status(200).json({
            success: true,
            userData: users
        });

    } catch (error) {
        console.error("listAllUsers error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = listAllUsers;