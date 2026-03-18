const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateTokenMiddleware');
const listAgents = require('../controllers/listAgents');
const listAgentTypes = require('../controllers/listAgentTypes');
const deleteAgent = require('../controllers/deleteAgent');
const createEditAgent = require('../controllers/createEditAgent');
const getAgentConfig = require('../controllers/getAgentConfig');

router.get("/list-agents", authenticateToken, listAgents);
router.get("/list-agent-types", authenticateToken, listAgentTypes);
router.post("/delete-agent", authenticateToken, deleteAgent);
router.post("/create-edit-agent", authenticateToken, createEditAgent);
router.post("/fetch-agent-config-fields/:configType", authenticateToken, getAgentConfig);


module.exports = router;
