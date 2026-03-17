const express = require('express');
const router = express.Router();
const login = require('./controllers/login');
const listUsers = require('./controllers/listUsers');
const authenticateToken = require('./middlewares/authenticateTokenMiddleware');
const userConfig = require('./controllers/userConfig');
const addUpdateUser = require('./controllers/addUpdateUser');
const deleteUser = require('./controllers/deleteUser');
const getAgentConfig = require('./controllers/getAgentConfig');
const deleteAgent = require('./controllers/deleteAgent');
const listAgents = require('./controllers/listAgents');
const listAgentTypes = require('./controllers/listAgentTypes');
const createEditAgent = require('./controllers/createEditAgent');
const listAllUsers = require('./controllers/listAllUsers');

// Public route for login
router.post("/login", login);

// router.post("/create-update-user",authenticateToken,)

router.get("/list-users", authenticateToken, listUsers);
router.get("/get-user-config", authenticateToken, userConfig);
router.post("/create-update-user", authenticateToken, addUpdateUser);
router.post("/delete-user", authenticateToken, deleteUser);
router.get("/list-all-users", authenticateToken, listAllUsers);

router.post("/fetch-agent-config-fields/:configType", authenticateToken, getAgentConfig);

router.post("/delete-agent", authenticateToken, deleteAgent);

router.get("/list-agents", authenticateToken, listAgents)

router.get("/list-agent-types", authenticateToken, listAgentTypes);

router.post("/create-edit-agent", authenticateToken, createEditAgent);





// Public test route
router.get("/test", (req, res) => {
  res.send("Routes are working!");
});



module.exports = router;