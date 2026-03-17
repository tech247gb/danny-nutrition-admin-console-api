const DynamicFieldConfig = require('../schemas/dynamic-field-config');
const DocumentStorage = require('../schemas/documentStorage');

const field_type_map = {
    checkbox: "array",
    select: "string",
    "search-select": "string",
    text: "string",
    number: "number"
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

const updateDocumentService = async (clientId, input_fields) => {
    const { documentId } = input_fields;

    if (!documentId) {
        throw { status: 400, message: "documentId is required" };
    }

    // 1. Get dynamic field config
    const configResult = await DynamicFieldConfig.aggregate([
        {
            $match: { client_id: clientId }
        },
        {
            $project: {
                _id: 0,
                fields: {
                    $map: {
                        input: "$config.document.fields",
                        as: "field",
                        in: {
                            field_key: "$$field.field_key",
                            field_type: "$$field.type",
                            required: "$$field.required"
                        }
                    }
                }
            }
        }
    ]);

    const dynamic_fields = configResult[0]?.fields || [];

    if (!Array.isArray(dynamic_fields) || dynamic_fields.length === 0) {
        throw { status: 400, message: "No dynamic fields for update" };
    }

    // 2. Prepare dynamic fields
    const dynamicFields = {};

    Object.keys(input_fields).forEach((field_key) => {
        if (field_key === "documentId") return;

        const currentField = dynamic_fields.find(
            field => field.field_key === field_key
        );

        if (!currentField?.field_type) return;

        const mappedType = field_type_map[currentField.field_type];
        if (!mappedType) return;

        dynamicFields[field_key] = prepareDynamicValue(
            input_fields[field_key],
            mappedType
        );
    });

    if (Object.keys(dynamicFields).length === 0) {
        throw { status: 400, message: "No valid dynamic fields to update" };
    }

    // 3. Update document
    const updatedDocument = await DocumentStorage.findOneAndUpdate(
        { documentId },
        { $set: dynamicFields },
        { new: true }
    );

    if (!updatedDocument) {
        throw { status: 404, message: "Document not found" };
    }

    return {
        documentId,
        updatedDocument
    };
};

module.exports = {
    updateDocumentService
};