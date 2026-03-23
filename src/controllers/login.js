const { loginService } = require('../services/login.service');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const result = await loginService({ username, password });

        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        return res.status(200).json({
            success: true,
            user: result.admin,
            token: result.token
        });

    } catch (error) {
        console.error("login controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = login;