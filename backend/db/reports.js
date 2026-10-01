const { col, toId } = require('./helpers');

module.exports = {
	async create({ postId, reporterId, reason, details }) {
		const doc = { postId: toId(postId), reporterId: toId(reporterId), reason, details, createdAt: new Date() };
		const result = await col('reports').insertOne(doc);
		return { ...doc, _id: result.insertedId };
	},
	findById: (id) => col('reports').findOne({ _id: toId(id) }),
	find: (postId, reporterId) => col('reports').findOne({ postId: toId(postId), reporterId: toId(reporterId) }),
	list: () => col('reports').find().sort({ createdAt: -1 }).limit(200).toArray(),
	remove: (id) => col('reports').deleteOne({ _id: toId(id) }),
	removeForPost: (postId) => col('reports').deleteMany({ postId: toId(postId) }),
	removeByReporter: (id) => col('reports').deleteMany({ reporterId: toId(id) }),

	listReasons: () => col('reportReasons').find().sort({ createdAt: 1 }).toArray(),
	findReason: (label) => col('reportReasons').findOne({ labelLower: String(label).toLowerCase() }),
	async createReason(label) {
		const doc = { label, labelLower: label.toLowerCase(), createdAt: new Date() };
		const result = await col('reportReasons').insertOne(doc);
		return { ...doc, _id: result.insertedId };
	},
	removeReason: (id) => col('reportReasons').deleteOne({ _id: toId(id) }),
};
