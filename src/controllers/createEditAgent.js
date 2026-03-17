const Agent = require('../schemas/agents');
const mongoose = require("mongoose");

const createEditAgent = async (req, res) => {
    try {

        const { name, type, status, prompt, language, channels } = req.body;
        const clientId = req.jwt_payload.id;
        const { _id } = req.query;
        let configObj;
        if (type === 'calendar_scheduling_agent') {
            const { appointment_days, appointment_start_time, appointment_end_time } = req.body;
            if (appointment_days && appointment_start_time && appointment_end_time) {
                configObj = {
                    config_fields: "appointment_days,appointment_start_time,appointment_end_time",
                    config_values: {
                        appointment_days: appointment_days,
                        appointment_start_time: appointment_start_time,
                        appointment_end_time: appointment_end_time
                    }
                }
                console.log("in csa", configObj)

            } else {
                res.status(500).json({
                    success: false,
                    message: "Missing Required field(s)"
                })
            }

        } else if (type === 'information_intake_agent') {
            const { intake_questions } = req.body;
            if (intake_questions) {
                configObj = {
                    config_fields: "intake_questions",
                    config_values: { intake_questions: intake_questions }
                }
                console.log("configobj in ia", configObj)


            } else {
                res.status(500).json({
                    success: false,
                    message: "Missing Required field(s)"
                })
            }

        } else {
            configObj = {
                config_fields: "",
                config_values: {}
            }
            console.log("configobj in iaelse", configObj)
        }
        let config_fields = configObj.config_fields ? configObj.config_fields : "";
        let config_values = configObj.config_values ? configObj.config_values : {};

        // let payloadSetting = {
        //     client_id: clientId,
        //     name,
        //     status,
        //     prompt,
        //     type,
        //     language,
        //     channels,
        //     config_fields,
        //     ...config_values
        // }
        if (_id) {
            let updatePayload = {
                name,
                status,
                prompt,
                type,
                language,
                channels,
            }

            if (config_fields) {

                const dynamicFields = config_fields.split(",").filter(Boolean);
                console.log(dynamicFields, "dynamicFields");

                dynamicFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        updatePayload[field] = req.body[field];
                    }
                });


            }


            await Agent.findByIdAndUpdate(_id, updatePayload);
            return res.status(200).json({
                success: true

            });


        } else {

            let insertPayload = {
                client_id: clientId,
                name,
                status,
                prompt,
                type,
                language,
                channels,
            }

            if (config_fields) {

                const dynamicFields = config_fields.split(",").filter(Boolean);
                console.log(dynamicFields, "dynamicFields2");
                dynamicFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        insertPayload[field] = req.body[field];
                    }
                });

            }
            console.log(insertPayload, "insertPayload");
            console.log(config_fields, "config_fields");
            const agentResult = await Agent.insertOne(insertPayload);
            return res.status(200).json({
                success: true

            });

        }

    } catch (error) {
        console.error("createEditAgent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = createEditAgent;