const DocumentStorage = require('../schemas/documentStorage');

const deleteDocumentService = async (_id) => {
    if (!_id || _id.trim() === "") {
        throw { status: 400, message: "Missing document id" };
    }

    // Delete document
    const deleteResult = await DocumentStorage.deleteOne({ documentId: _id });

    if (deleteResult.deletedCount === 0) {
        return {
            success: false,
            id: _id
        };
    }

    return {
        success: true,
        id: _id
    };


};

module.exports = {
    deleteDocumentService
};