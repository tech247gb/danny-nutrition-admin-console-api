const { createUserService, updateUserService } = require('../services/userAddEdit.service');


const createUpdateUser = async (req, res) => {
  try {
    const clientId = req.jwt_payload.id;
    const _id = req.query._id;

    if (_id?.trim()) {
      // UPDATE flow
      const updatedUser = await updateUserService(clientId, _id, req.body);

      return res.status(200).json({
        success: true,
        data: {
          name: updatedUser.name,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
          userId: updatedUser.userId
        }
      });

    } else {
      // CREATE flow
      const newUser = await createUserService(clientId, req.body);

      return res.status(200).json({
        success: true,
        data: {
          name: newUser.name,
          gender: newUser.gender,
          dob: newUser.dob,
          userId: newUser.userId,
          onboarding_week: newUser.onboarding_week
        }
      });
    }

  } catch (error) {
    console.error("createUpdateUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = createUpdateUser;