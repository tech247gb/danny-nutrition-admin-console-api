const DocumentStorage = require("../schemas/documentStorage");

const PAGE_SIZE = 10;

const getDocuments = async (clientId, { offset = 0, search } = {}) => {
  const skip = Number(offset) * PAGE_SIZE;

  const matchStage = { client_id: clientId };
  if (search?.trim()) {
    matchStage["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { document_week: { $regex: search, $options: "i" } },
      { document_type: search }
    ];
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { _id: -1 } },
    { $group: { _id: "$documentId", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: { $mergeObjects: ["$doc", { _id: "$_id" }] } } },
    { $sort: { _id: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: PAGE_SIZE },
          { $project: { _id: 1, name: 1, documentId: 1, document_week: 1, document_type: 1, fileType: 1 } }
        ],
        totalCount: [{ $count: "totalDocuments" }]
      }
    }
  ];

  const result = await DocumentStorage.aggregate(pipeline);
  console.log(result, "result");
  return {
    documents: result[0]?.data || [],
    total: result[0]?.totalCount[0]?.totalDocuments || 0
  };
};

module.exports = { getDocuments };
