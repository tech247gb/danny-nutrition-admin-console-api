const User = require('../schemas/users');

const listAllUsersService = async (adminId) => {
    if (!adminId) {
        throw { status: 400, message: "Admin id is required" };
    }

    const users = await User.find(
        { client_id: adminId },
        { _id: 1, name: 1 }
    ).lean();

    return users;
};

module.exports = {
    listAllUsersService
};