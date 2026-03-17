const User = require('../schemas/users');
const DynamicFieldConfig = require('../schemas/dynamic-field-config');
const AgentType = require('../schemas/agent_types');
const Notification = require('../schemas/notifications');
// const NotificationLog = require('../schemas/notification-logs');
const ShortTermConversationContext = require('../schemas/short-term-conversation-context');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// Helpers (from n8n Code nodes)
// ─────────────────────────────────────────────
const field_type_map = {
  "checkbox": "array",
  "select": "string",
  "search-select": "string",
  "text": "string",
  "number": "number",
  "email": "string"
};

function prepareDynamicValue(value, type) {
  if (value == null) return value;
  switch (type) {
    case "string":
      return typeof value === "string" ? value : String(value);
    case "array":
      return Array.isArray(value)
        ? value
        : typeof value === "string"
          ? value.split(",").map(v => v.trim()).filter(Boolean)
          : [];
    case "number":
      // ✅ Fixed from n8n: isNaN check was inverted — return null for invalid
      return isNaN(value) ? null : Number(value);
    default:
      return value;
  }
}

function sanitizeDynamicFields(input_fields, dynamic_fields) {
  const dynamicFields = {};
  if (!Array.isArray(dynamic_fields) || !dynamic_fields.length) return dynamicFields;

  Object.keys(input_fields).forEach((field_key) => {
    const currentFieldType = dynamic_fields.find(f => f?.field_key === field_key);
    if (!currentFieldType?.field_type) return;

    const currentValueType = field_type_map[currentFieldType.field_type] ?? null;
    if (!currentValueType) return;

    // ✅ Fixed from n8n: was passing currentValueType.type (undefined)
    // currentValueType is already a string like "string", "number", "array"
    dynamicFields[field_key] = prepareDynamicValue(input_fields[field_key], currentValueType);
  });

  return dynamicFields;
}

// ─────────────────────────────────────────────
// Main Controller
// ─────────────────────────────────────────────
const createUpdateUser = async (req, res) => {
  try {
    const clientId = req.jwt_payload.id;
    const _id = req.query._id;
    const input_fields = req.body;
    const { name, gender, dob, agents = [], phone_number } = req.body;

    // Clean phone number
    const userId = phone_number ? phone_number.replace(/\D/g, '') : undefined;

    // ─────────────────────────────────────────────
    // Node: "Group Agent Types / Group Agent Types1"
    // Extract agent types from agents array
    // ─────────────────────────────────────────────
    const agent_types = agents.map(agent => agent.type);
    const available_agents = agents;

    // ─────────────────────────────────────────────
    // Node: "If1" — _id exists → UPDATE, else → CREATE
    // ─────────────────────────────────────────────
    if (_id?.trim()) {

      // ── UPDATE FLOW ──────────────────────────

      // Node: "Users Dynamic Fields"
      // Fetch client-level dynamic field config
      const usersDynamicFieldsResult = await DynamicFieldConfig.aggregate([
        { $match: { client_id: clientId } },
        {
          $project: {
            _id: 0,
            fields: {
              $map: {
                input: "$config.users.fields",
                as: "field",
                in: { field_key: "$$field.field_key", field_type: "$$field.type" }
              }
            }
          }
        }
      ]);
      const usersDynamicFields = usersDynamicFieldsResult[0]?.fields || [];

      // Node: "Fetch Agent Dynamic Field1"
      // Fetch agent-type-level dynamic fields
      const agentDynamicFieldsResult = await AgentType.aggregate([
        { $match: { type: { $in: agent_types } } },
        {
          $project: {
            _id: 0,
            mappedFields: {
              $map: {
                input: { $ifNull: ["$config.users.fields", []] },
                as: "field",
                in: { field_key: "$$field.field_key", field_type: "$$field.type" }
              }
            }
          }
        },
        { $group: { _id: null, allFields: { $push: "$mappedFields" } } },
        {
          $project: {
            _id: 0,
            fields: {
              $reduce: {
                input: "$allFields",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }
              }
            }
          }
        }
      ]);
      const agentDynamicFields = agentDynamicFieldsResult[0]?.fields || [];

      // Node: "Code in JavaScript2" — merge both field configs
      const combined_fields = [...usersDynamicFields, ...agentDynamicFields];

      // Node: "Sanitize Update Payload"
      const dynamicFields = sanitizeDynamicFields(input_fields, combined_fields);

      const updatePayload = {
        userId,
        name,
        gender,
        dob,
        available_agents,
        ...dynamicFields
      };

      // Node: "Find and update documents"
      const updatedUser = await User.findByIdAndUpdate(_id, updatePayload, { new: true });

      // Node: "Aggregate documents"
      // Clear name in short-term-conversation-context for all user_pks
      const user_pks = available_agents.map(a => `${updatedUser._id}_${a.agent_id}`);
      await ShortTermConversationContext.aggregate([
        { $match: { user_pk: { $in: user_pks } } },
        { $set: { name: "" } },
        {
          $merge: {
            into: "short-term-conversation-context",
            on: "user_pk",
            whenMatched: "merge",
            whenNotMatched: "discard"
          }
        }
      ]);

      // Node: "Update Response" → "Respond to Webhook"
      return res.status(200).json({
        success: 1,
        data: {
          name: updatedUser.name,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
          userId: updatedUser.userId
        }
      });

    } else {

      // ── CREATE FLOW ──────────────────────────

      // Node: "Fetch Users Dynamic Fields"
      const usersDynamicFieldsResult = await DynamicFieldConfig.aggregate([
        { $match: { client_id: clientId } },
        {
          $project: {
            _id: 0,
            fields: {
              $map: {
                input: "$config.users.fields",
                as: "field",
                in: { field_key: "$$field.field_key", field_type: "$$field.type" }
              }
            }
          }
        }
      ]);
      const usersDynamicFields = usersDynamicFieldsResult[0]?.fields || [];

      // Node: "Fetch Agent Dynamic Field"
      const agentDynamicFieldsResult = await AgentType.aggregate([
        { $match: { type: { $in: agent_types } } },
        {
          $project: {
            _id: 0,
            mappedFields: {
              $map: {
                input: { $ifNull: ["$config.users.fields", []] },
                as: "field",
                in: { field_key: "$$field.field_key", field_type: "$$field.type" }
              }
            }
          }
        },
        { $group: { _id: null, allFields: { $push: "$mappedFields" } } },
        {
          $project: {
            _id: 0,
            fields: {
              $reduce: {
                input: "$allFields",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }
              }
            }
          }
        }
      ]);
      const agentDynamicFields = agentDynamicFieldsResult[0]?.fields || [];

      // Node: "Prepare Agent Fields" — merge both field configs
      const combined_fields = [...usersDynamicFields, ...agentDynamicFields];

      // Node: "Sanitize Add Payload"
      const dynamicFields = sanitizeDynamicFields(input_fields, combined_fields);

      const insertPayload = {
        client_id: clientId,
        userId,
        name,
        gender,
        dob,
        available_agents,
        ...dynamicFields
      };

      // Node: "Create Users"
      const newUser = await User.create(insertPayload);

      // Node: "Check for Join Notification Trigger"
      const notificationTrigger = await Notification.findOne({
        client_id: clientId,
        status: true,
        trigger_type: "event_trigger",
        trigger_config: "user_joined"
      });

      // Node: "Notification Trigger Exist?"
      // if (notificationTrigger) {

      //   // Node: "Prepare Join Notification"
      //   const notificationLog = {
      //     client_id:         clientId,
      //     notification_id:   notificationTrigger._id,
      //     user_id:           newUser._id,
      //     templateId:        notificationTrigger.templateId,
      //     has_parameters:    notificationTrigger.has_parameters,
      //     parameters_config: notificationTrigger.parameters_config ?? null,
      //     sender_id:         notificationTrigger.sender_id,
      //     channel:           notificationTrigger.channel,
      //     status:            "pending",
      //     sent_at:           null,
      //     last_error:        null,
      //     created_at:        new Date(),
      //     updated_at:        new Date(),
      //     try_count:         0
      //   };

      //   // Node: "Schedule Notification"
      //   await NotificationLog.create(notificationLog);
      // }

      // Node: "Creation Response" → "Respond to Webhook"
      return res.status(200).json({
        success: 1,
        data: {
          name: newUser.name,
          gender: newUser.gender,
          dob: newUser.dob,
          userId: newUser.userId,
          onboarding_week: newUser.onboarding_week
        }
      });
    }

  } catch (error) {
    console.error("createUpdateUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = createUpdateUser;