const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../schemas/admin");

const loginService = async ({ username, password }) => {


    const admin = await Admin.findOne({ username });

    if (!admin) {
        return {
            success: false,
            status: 404,
            message: "User not found"
        };
    }


    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
        return {
            success: false,
            status: 401,
            message: "Invalid credentials"
        };
    }


    const payload = {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1 day
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET
    );

    const formattedUser = {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        config: admin.config,
        whitelabel: admin.whitelabel
    };


    return {
        success: true,
        status: 200,
        admin: formattedUser,
        token
    };
};

module.exports = {
    loginService
};