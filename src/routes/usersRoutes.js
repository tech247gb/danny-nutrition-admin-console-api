const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateTokenMiddleware');
const listUsers = require('../controllers/listUsers');
const listAllUsers = require('../controllers/listAllUsers');
const userConfig = require('../controllers/userConfig');
const deleteUser = require('../controllers/deleteUser');

router.get('/list-users', authenticateToken, listUsers);
router.get("/list-all-users", authenticateToken, listAllUsers);
router.get("/get-user-config", authenticateToken, userConfig);
router.post("/delete-user", authenticateToken, deleteUser);


module.exports = router;