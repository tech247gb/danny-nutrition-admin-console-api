const { updateDocumentService } = require('../services/documentUpdate.service');

const updateDocument = async (req, res) => {
    try {
        const clientId = req.jwt_payload.id;
        const input_fields = req.body;

        const result = await updateDocumentService(clientId, input_fields);

        return res.status(200).json({
            success: true,
            documentId: result.documentId
        });


    } catch (error) {
        console.error("updateDocument error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = updateDocument;
