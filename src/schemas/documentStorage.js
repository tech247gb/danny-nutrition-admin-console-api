const mongoose = require("mongoose");

const documentStorageSchema = new mongoose.Schema({
  documentId: String,
  name: String,
  document_week: String,
  document_type: Array,
  fileType: String,
  client_id: String
}, {
  collection: "document-storage",
  strict: false,
  strictQuery: false
});

module.exports = mongoose.model("DocumentStorage", documentStorageSchema, "document-storage");
