const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../schemas/admin");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // validation
        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        // find admin in DB
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // bcrypt password check
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const payload = {
            id: admin._id,
            username: admin.username,
            name: admin.name,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1 day
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET || "abc123"
        );

        res.json({
            success: true,
            user: {
                id: admin._id,
                username: admin.username,
                name: admin.name,
                config: admin.config,
                whitelabel: admin.whitelabel
            },
            token: accessToken
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = login;