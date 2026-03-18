const { deleteUserService } = require('../services/userDelete.service');


const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const deletedCount = await deleteUserService(userId);

        if (deletedCount > 0) {
            return res.status(200).json({
                success: true,
                userId
            });
        } else {
            return res.status(200).json({
                success: false
            });
        }
    } catch (error) {
        if (error.status && error.message) {
            return res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        console.error("deleteUser error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = deleteUser;