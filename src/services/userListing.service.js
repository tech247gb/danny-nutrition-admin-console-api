const User = require('../schemas/users');

const listUsersService = async ({ adminId, offset, search }) => {
    const page = parseInt(offset) || 0;
    const limit = 10;
    const skipCount = page * limit;

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
                        { $limit: limit }
                    ],
                    totalCount: [{ $count: "totalUsers" }]
                }
            }
        ]
        : [
            {
                $match: { client_id: adminId }
            },
            {
                $facet: {
                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: skipCount },
                        { $limit: limit }
                    ],
                    totalCount: [{ $count: "totalUsers" }]
                }
            }
        ];

    const result = await User.aggregate(pipeline);

    return {
        userList: result[0]?.data || [],
        totalUsers: result[0]?.totalCount?.[0]?.totalUsers || 0
    };
};

module.exports = {
    listUsersService
};