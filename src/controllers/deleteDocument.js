const { deleteDocumentService } = require('../services/documentDelete.service');

const deleteDocument = async (req, res) => {
    try {
        const { _id } = req.body;
        console.log("Deleting document id:", _id);

        const result = await deleteDocumentService(_id);

        if (result.success) {
            return res.status(200).json({
                success: true,
                id: result.id
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Document not found or could not be deleted"
            });
        }

    } catch (error) {
        console.error("deleteDocument error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports = deleteDocument;