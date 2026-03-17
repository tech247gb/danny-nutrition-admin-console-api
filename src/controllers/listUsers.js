const User = require('../schemas/users');

const listUsers = async (req, res) => {
    try {
        const { id } = req.jwt_payload;
        const adminId = id;

        const { offset, search } = req.query;
        const skipCount = parseInt(offset) * 10; // ✅ safe parse with default 0
        console.log("offser=seartch", offset, search)
        // ✅ Fixed: check if search is a non-empty string, not a literal space
        const pipeline = search?.trim()
            ? [
                {
                    $match: {
                        client_id: adminId,
                        $or: [
                            { name: { $regex: search, $options: "i" } },
                            { userId: { $regex: search, $options: "i" } }
                        ]
                    }
                },
                {
                    $facet: {
                        data: [
                            { $sort: { _id: -1 } },
                            { $skip: skipCount },
                            { $limit: 10 }
                        ],
                        totalCount: [
                            { $count: "totalUsers" }
                        ]
                    }
                }
            ]
            : [
                {
                    $match: {
                        client_id: adminId
                    }
                },
                {
                    $facet: {
                        data: [
                            { $sort: { _id: -1 } },
                            { $skip: skipCount },
                            { $limit: 10 }
                        ],
                        totalCount: [
                            { $count: "totalUsers" }
                        ]
                    }
                }
            ];

        // ✅ Fixed: single aggregate call covers both branches
        const result = await User.aggregate(pipeline);
        const response = [{ userList: result[0]?.data || [], totalUsers: result[0]?.totalCount[0]?.totalUsers || 0 }]
        console.log("dddddddddddddddddddddddddddddd", response)

        return res.send(response);

    } catch (error) {
        console.error("listUsers error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = listUsers;