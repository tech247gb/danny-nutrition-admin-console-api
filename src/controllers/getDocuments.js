const documentStorageService = require("../services/documentStorage.service");

const getDocuments = async (req, res) => {
    try {

        const clientId = req.jwt_payload.id;
        const { offset = 0, search } = req.query;

        const result = await documentStorageService.getDocuments(clientId, { offset, search });

        res.json([{
            totalDocuments: result.total,
            documentList: result.documents
        }]);

    } catch (error) {
        console.error("getDocuments error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

module.exports = getDocuments;
