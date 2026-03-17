const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateTokenMiddleware');
const getDocuments = require('../controllers/getDocuments');
const updateDocument = require('../controllers/updateDocument');
const deleteDocument = require('../controllers/deleteDocument');

// GET /api/documents
// GET /api/documents?offset=0&search=test
router.get('/getDocuments', authenticateToken, getDocuments);
router.post('/update-document', authenticateToken, updateDocument);
router.post('/delete-document', authenticateToken, deleteDocument);



module.exports = router;
