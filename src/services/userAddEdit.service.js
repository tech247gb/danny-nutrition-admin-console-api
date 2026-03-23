
const User = require('../schemas/users');
const DynamicFieldConfig = require('../schemas/dynamic-field-config');
const AgentType = require('../schemas/agent_types');
const Notification = require('../schemas/notifications');
const NotificationLog = require('../schemas/notification_logs');
const ShortTermConversationContext = require('../schemas/short-term-conversation-context');


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

        dynamicFields[field_key] = prepareDynamicValue(input_fields[field_key], currentValueType);
    });

    return dynamicFields;
}


async function fetchCombinedDynamicFields(clientId, agent_types) {

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

    return [...usersDynamicFields, ...agentDynamicFields];
}


const updateUserService = async (clientId, _id, input_fields) => {
    const { name, gender, dob, agents = [], phone_number } = input_fields;

    const userId = phone_number ? phone_number.replace(/\D/g, '') : undefined;
    const agent_types = agents.map(agent => agent.type);
    const available_agents = agents;


    const combined_fields = await fetchCombinedDynamicFields(clientId, agent_types);

    const dynamicFields = sanitizeDynamicFields(input_fields, combined_fields);

    const updatePayload = {
        userId,
        name,
        gender,
        dob,
        available_agents,
        ...dynamicFields
    };


    const updatedUser = await User.findByIdAndUpdate(_id, updatePayload, { new: true });

    // Node: "Aggregate documents"
    // Clear name in short-term-conversation-context for all user_pks
    //   const user_pks = available_agents.map(a => `${updatedUser._id}_${a.agent_id}`);
    //   await ShortTermConversationContext.aggregate([
    //     { $match: { user_pk: { $in: user_pks } } },
    //     { $set: { name: "" } },
    //     {
    //       $merge: {
    //         into: "short-term-conversation-context",
    //         on: "user_pk",
    //         whenMatched:    "merge",
    //         whenNotMatched: "discard"
    //       }
    //     }
    //   ]);

    return updatedUser;
};


const createUserService = async (clientId, input_fields) => {
    const { name, gender, dob, agents = [], phone_number } = input_fields;

    const userId = phone_number ? phone_number.replace(/\D/g, '') : undefined;
    const agent_types = agents.map(agent => agent.type);
    const available_agents = agents;


    const combined_fields = await fetchCombinedDynamicFields(clientId, agent_types);


    const dynamicFields = sanitizeDynamicFields(input_fields, combined_fields);
    console.log("dynamic create feild dat rom functiom", dynamicFields);

    const insertPayload = {
        client_id: clientId,
        userId,
        name,
        gender,
        dob,
        available_agents,
        ...dynamicFields
    };

    console.log("@@@@@@@@@@insert", insertPayload);


    const newUser = await User.create(insertPayload);


    const notificationTrigger = await Notification.findOne({
        client_id: clientId,
        status: true,
        trigger_type: "event_trigger",
        trigger_config: "user_joined"
    });


    if (notificationTrigger) {

        await NotificationLog.create({
            client_id: clientId,
            notification_id: notificationTrigger._id,
            user_id: newUser._id,
            templateId: notificationTrigger.templateId,
            has_parameters: notificationTrigger.has_parameters,
            parameters_config: notificationTrigger.parameters_config ?? null,
            sender_id: notificationTrigger.sender_id,
            channel: notificationTrigger.channel,
            status: "pending",
            sent_at: null,
            last_error: null,
            created_at: new Date(),
            updated_at: new Date(),
            try_count: 0
        });
    }

    return newUser;
};

module.exports = {
    createUserService,
    updateUserService
};