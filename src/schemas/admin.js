const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true
    },

    name: {
      type: String,
    },

    password: {
      type: String,
    },

    whitelabel: {
      type: String
    },
    config: {
      type: Object
    },
    channels: {
      type: Array
    }
  }
);

module.exports = mongoose.model("Admin", adminSchema, "admin");