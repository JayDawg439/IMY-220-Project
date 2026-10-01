const { col, toId } = require('./helpers');

const LIST = { projection: { imageData: 0 } };

module.exports = {
	async create({ authorId, imageData, caption, hashtags }) {
		const now = new Date();
		const doc = { authorId: toId(authorId), imageData, caption, hashtags, likes: [], createdAt: now, updatedAt: now };
		const result = await col('posts').insertOne(doc);
		return { ...doc, _id: result.insertedId };
	},
	findById: (id) => col('posts').findOne({ _id: toId(id) }, LIST),
	getImage: (id) => col('posts').findOne({ _id: toId(id) }, { projection: { imageData: 1, updatedAt: 1 } }),
	find: (filter, limit = 100) => col('posts').find(filter, LIST).sort({ createdAt: -1 }).limit(limit).toArray(),
	findByIds: (ids) => col('posts').find({ _id: { $in: ids } }, LIST).toArray(),
	countByAuthor: (id) => col('posts').countDocuments({ authorId: toId(id) }),
	update: (id, fields) => col('posts').updateOne({ _id: toId(id) }, { $set: { ...fields, updatedAt: new Date() } }),
	remove: (id) => col('posts').deleteOne({ _id: toId(id) }),
	count: () => col('posts').countDocuments(),
	like: (id, userId) => col('posts').updateOne({ _id: toId(id) }, { $addToSet: { likes: toId(userId) } }),
	unlike: (id, userId) => col('posts').updateOne({ _id: toId(id) }, { $pull: { likes: toId(userId) } }),
	removeLikesBy: (userId) => col('posts').updateMany({}, { $pull: { likes: toId(userId) } }),
};
