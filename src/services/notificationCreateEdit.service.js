
const Notification = require("../schemas/notifications");
const User = require("../schemas/users");
const Template = require("../schemas/notification_templates");


function getNextDailyRun(currentDate, time, intervalDays, lastRunAt) {
    const [h, m] = time.split(":").map(Number);
    const interval = intervalDays || 1;

    if (!lastRunAt) {
        const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
        const scheduledTime = h * 60 + m;

        const next = new Date(currentDate);
        next.setHours(h, m, 0, 0);

        if (scheduledTime > currentTime) return next;

        next.setDate(currentDate.getDate() + interval);
        return next;
    }

    const lastRun = new Date(lastRunAt);
    const next = new Date(lastRun);
    next.setDate(lastRun.getDate() + interval);
    next.setHours(h, m, 0, 0);

    return next;
}

function findNextWeekly(currentDate, daysOfWeek, time) {
    const [h, m] = time.split(":").map(Number);
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    const currentWeekday = currentDate.getDay();
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    const scheduledTime = h * 60 + m;

    for (const day of sortedDays) {
        if (
            day > currentWeekday ||
            (day === currentWeekday && scheduledTime > currentTime)
        ) {
            const diff = (day - currentWeekday + 7) % 7;
            const next = new Date(currentDate);
            next.setDate(currentDate.getDate() + diff);
            next.setHours(h, m, 0, 0);
            return next;
        }
    }

    const firstDay = sortedDays[0];
    const diff = (firstDay - currentWeekday + 7) % 7 || 7;
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + diff);
    next.setHours(h, m, 0, 0);
    return next;
}

// ================= SERVICE =================

const createEditNotificationService = async (req) => {

    const body = req.body;
    const jwtPayload = req.jwt_payload;
    const query = req.query;
    console.log("*********************************************")
    // ================= REQUIRED FIELD VALIDATION =================
    if (
        !body.name ||
        !body.trigger_type ||
        !body.templateId ||
        body.name === "" ||
        body.trigger_type === "" ||
        body.templateId === ""
    ) {
        return {
            status: 422,
            body: {
                success: false,
                message: "Missing requried field(s)"
            }
        };
    }

    // ================= FIND TEMPLATE =================
    const template = await Template.findOne({
        client_id: jwtPayload.id,
        template_id: body.templateId
    });

    const templateData = {

        name: body.name,
        status: body.status,
        trigger_type: body.trigger_type,
        trigger_config: body.trigger_config,
        sender_id: body.sender_id,
        channel: body.channel,
        templateId: body.templateId,
        parameters_config: template?.parameters_config ?? null,
        has_parameters: template?.has_parameters,
        users: body.users


    };

    // ================= SCHEDULED TRIGGER =================
    if (templateData.trigger_type === "scheduled_trigger") {

        let finalUsers = templateData.users;

        if (
            Array.isArray(finalUsers) &&
            finalUsers.includes("all_users") &&
            finalUsers.length === 1
        ) {
            const users = await User.find(
                { client_id: jwtPayload.id },
                { _id: 1 }
            );
            finalUsers = users.map(u => u._id.toString());
        }

        const triggerType = templateData.trigger_config?.type;

        let next_run_at = null;
        let start_date = new Date();
        let last_run_at = null;

        // ===== ONCE =====
        if (triggerType === "once") {

            if (
                !templateData.trigger_config.date ||
                !templateData.trigger_config.time
            ) {
                return error422();
            }

            const nextRunTime = new Date(templateData.trigger_config.date);
            const [h, m] = templateData.trigger_config.time.split(":");
            nextRunTime.setHours(h, m, 0, 0);

            next_run_at = nextRunTime;
        }

        // ===== DAILY =====
        else if (triggerType === "daily") {

            if (
                templateData.trigger_config.interval === undefined ||
                !templateData.trigger_config.time
            ) {
                return error422();
            }

            const now = new Date();

            next_run_at = getNextDailyRun(
                now,
                templateData.trigger_config.time,
                templateData.trigger_config.interval,
                null
            );
        }

        // ===== WEEKLY =====
        else if (triggerType === "weekly") {

            if (
                !templateData.trigger_config.days_of_week ||
                !templateData.trigger_config.time ||
                templateData.trigger_config.days_of_week.length === 0
            ) {
                return error422();
            }

            const now = new Date();

            next_run_at = findNextWeekly(
                now,
                templateData.trigger_config.days_of_week,
                templateData.trigger_config.time
            );
        }

        else {
            return error422();
        }

        if (query._id) {
            await Notification.findOneAndUpdate(
                { _id: query._id },
                {
                    name: templateData.name,
                    status: templateData.status,
                    trigger_type: templateData.trigger_type,
                    trigger_config: templateData.trigger_config,
                    users: finalUsers,
                    sender_id: templateData.sender_id,
                    channel: templateData.channel,
                    templateId: templateData.templateId,
                    has_parameters: templateData.has_parameters,
                    parameters_config: templateData.parameters_config,
                    next_run_at: templateData.status ? next_run_at : null
                }
            );

            return success();
        }

        await Notification.create({
            client_id: jwtPayload.id,
            name: templateData.name,
            status: templateData.status,
            trigger_type: templateData.trigger_type,
            trigger_config: templateData.trigger_config,
            users: finalUsers,
            sender_id: templateData.sender_id,
            channel: templateData.channel,
            templateId: templateData.templateId,
            has_parameters: templateData.has_parameters,
            parameters_config: templateData.parameters_config,
            last_run_at,
            start_date,
            next_run_at
        });

        return success();
    }

    // ================= EVENT TRIGGER =================
    else if (templateData.trigger_type === "event_trigger") {

        if (query._id) {

            if (templateData.trigger_config !== "user_joined") {
                return error422();
            }

            await Notification.findOneAndUpdate(
                { _id: query._id },
                {
                    name: templateData.name,
                    status: templateData.status,
                    trigger_config: templateData.trigger_config,
                    users: templateData.users,
                    sender_id: templateData.sender_id,
                    channel: templateData.channel,
                    templateId: templateData.templateId,
                    has_parameters: templateData.has_parameters,
                    parameters_config: templateData.parameters_config
                }
            );

            return success();
        }

        const existing = await Notification.aggregate([
            {
                $match: {
                    client_id: jwtPayload.id,
                    trigger_type: templateData.trigger_type,
                    trigger_config: templateData.trigger_config
                }
            },
            { $count: "total" }
        ]);

        const total = existing[0]?.total || 0;

        if (total >= 1) {
            return {
                status: 409,
                body: {
                    success: false,
                    message: "Event Already Exist"
                }
            };
        }

        await Notification.create({
            client_id: jwtPayload.id,
            name: templateData.name,
            status: templateData.status,
            trigger_type: templateData.trigger_type,
            trigger_config: templateData.trigger_config,
            sender_id: templateData.sender_id,
            channel: templateData.channel,
            templateId: templateData.templateId,
            has_parameters: templateData.has_parameters,
            parameters_config: templateData.parameters_config,
            start_date: new Date()
        });

        return success();
    }

    return error422();
};

// ================= HELPERS =================

const error422 = () => ({
    status: 422,
    body: {
        success: false,
        message: "Incorrect trigger configration"
    }
});

const success = () => ({
    status: 200,
    body: { success: true }
});

module.exports = {
    createEditNotificationService
};