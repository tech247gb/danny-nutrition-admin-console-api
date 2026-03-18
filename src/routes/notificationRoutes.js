const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateTokenMiddleware');
const getNotificationChannels = require('../controllers/getNotificationChannels');
const getNotificationTemplates = require('../controllers/getNotificationTemplates');
const deleteNotification = require('../controllers/deleteNotification');
const getNotifications = require('../controllers/getNotifications');

router.get("/get-notification-channels", authenticateToken, getNotificationChannels);
router.get("/get-notification-templates", authenticateToken, getNotificationTemplates);
router.post("/delete-notification", authenticateToken, deleteNotification);
router.get("/get-notifications", authenticateToken, getNotifications);

module.exports = router;
