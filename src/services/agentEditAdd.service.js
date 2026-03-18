const Agent = require('../schemas/agents');
const mongoose = require("mongoose");

const createEditAgentService = async (body, query, jwt_payload) => {
    try {
        const { name, type, status, prompt, language, channels } = body;
        const clientId = jwt_payload.id;
        const { _id } = query;

        let config_fields = "";
        let config_values = {};


        if (type === 'calendar_scheduling_agent') {
            const { appointment_days, appointment_start_time, appointment_end_time } = body;

            if (
                Array.isArray(appointment_days) &&
                appointment_days.length > 0 &&
                appointment_start_time?.trim() &&
                appointment_end_time?.trim()
            ) {
                config_fields = "appointment_days,appointment_start_time,appointment_end_time";
                config_values = {
                    appointment_days,
                    appointment_start_time,
                    appointment_end_time
                };
            } else {
                return {
                    status: 500,
                    response: {
                        success: false,
                        message: "Missing Required field(s)"
                    }
                };
            }

        } else if (type === 'information_intake_agent') {
            const { intake_questions } = body;

            if (
                intake_questions &&
                typeof intake_questions === "object" &&
                Object.keys(intake_questions).length > 0
            ) {
                config_fields = "intake_questions";
                config_values = {
                    intake_questions
                };
            } else {
                return {
                    status: 500,
                    response: {
                        success: false,
                        message: "Missing Required field(s)"
                    }
                };
            }

        } else {
            config_fields = "";
            config_values = {};
        }


        if (_id) {

            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return {
                    status: 400,
                    response: {
                        success: false,
                        message: "Invalid ID"
                    }
                };
            }

            let updatePayload = {
                name,
                status,
                prompt,
                type,
                language,
                channels
            };

            const dynamicFields = config_fields.split(",").filter(Boolean);

            dynamicFields.forEach(field => {
                if (config_values[field] !== undefined) {
                    updatePayload[field] = config_values[field];
                }
            });

            await Agent.findByIdAndUpdate(_id, updatePayload, { new: true });

            return {
                status: 200,
                response: {
                    success: true
                }
            };

        } else {

            let insertPayload = {
                client_id: clientId,
                name,
                status,
                prompt,
                type,
                language,
                channels
            };

            const dynamicFields = config_fields.split(",").filter(Boolean);

            dynamicFields.forEach(field => {
                if (config_values[field] !== undefined) {
                    insertPayload[field] = config_values[field];
                }
            });

            await Agent.create(insertPayload);

            return {
                status: 200,
                response: {
                    success: true
                }
            };
        }

    } catch (error) {
        console.error("createEditAgentService error:", error);
        throw error;
    }
};

module.exports = {
    createEditAgentService
};