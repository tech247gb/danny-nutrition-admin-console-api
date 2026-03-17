const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    config: {
      type: Object,
      default: {}
    },

    channels: {
      type: [Object],
      default: []
    },

    whitelabel: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Admin", adminSchema, "admin");