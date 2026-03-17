const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({

    name: String,
    status: Boolean,
    type: String,
    client_id: String,

}, // <--- End of definition object
    { // <--- Start of options object
        collection: "agents",
        strict: false,
        strictQuery: false
    });

module.exports = mongoose.model("Agent", agentSchema, "agents");
