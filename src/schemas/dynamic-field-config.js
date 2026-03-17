const mongoose = require('mongoose');

const dynamicFieldConfigSchema = new mongoose.Schema({
  client_id: String
}, {
  collection: "dynamic-field-config",
  strict: false,
  strictQuery: false
});

module.exports = mongoose.model('DynamicFieldConfig', dynamicFieldConfigSchema, 'dynamic-field-config');