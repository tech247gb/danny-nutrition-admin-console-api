
const mongoose = require('mongoose');

const agentTypeSchema = new mongoose.Schema({
  type: String,
  name: String,
  enabled: Boolean
}, {
  collection: "agent_types",
  strict: false,
  strictQuery: false
});

module.exports = mongoose.model('AgentType', agentTypeSchema, 'agent_types');
