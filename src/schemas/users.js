const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: String,
    name: String,
    gender: String,
    dob: String,
    client_id: String
}, // <--- End of definition object
    { // <--- Start of options object
        collection: "users",
        strict: false,
        strictQuery: false
    });

module.exports = mongoose.model("User", userSchema, "users");