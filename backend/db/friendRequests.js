const { col, toId } = require('./helpers');

module.exports = {
	find: (from, to) => col('friendRequests').findOne({ from: toId(from), to: toId(to) }),
	incoming: (userId) => col('friendRequests').find({ to: toId(userId) }).sort({ createdAt: -1 }).toArray(),
	async create(from, to) {
		const doc = { from: toId(from), to: toId(to), createdAt: new Date() };
		const result = await col('friendRequests').insertOne(doc);
		return { ...doc, _id: result.insertedId };
	},
	remove: (from, to) => col('friendRequests').deleteOne({ from: toId(from), to: toId(to) }),
	removeBetween: (a, b) => col('friendRequests').deleteMany({
		$or: [{ from: toId(a), to: toId(b) }, { from: toId(b), to: toId(a) }],
	}),
	removeAllFor: (id) => col('friendRequests').deleteMany({ $or: [{ from: toId(id) }, { to: toId(id) }] }),
};
