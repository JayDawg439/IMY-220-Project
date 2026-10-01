const { col, toId } = require('./helpers');

module.exports = {
  async create({ ownerId, name, description, hashtags }) {
    const now = new Date();
    const doc = { ownerId: toId(ownerId), name, description, hashtags, postIds: [], createdAt: now, updatedAt: now };
    const result = await col('albums').insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },
  findById: (id) => col('albums').findOne({ _id: toId(id) }),
  list: (filter = {}) => col('albums').find(filter).sort({ createdAt: -1 }).limit(100).toArray(),
  count: () => col('albums').countDocuments(),
  update: (id, fields) => col('albums').updateOne({ _id: toId(id) }, { $set: { ...fields, updatedAt: new Date() } }),
  remove: (id) => col('albums').deleteOne({ _id: toId(id) }),
  removeByOwner: (ownerId) => col('albums').deleteMany({ ownerId: toId(ownerId) }),
  addPost: (id, postId) => col('albums').updateOne({ _id: toId(id) }, { $addToSet: { postIds: toId(postId) }, $set: { updatedAt: new Date() } }),
  removePost: (id, postId) => col('albums').updateOne({ _id: toId(id) }, { $pull: { postIds: toId(postId) }, $set: { updatedAt: new Date() } }),
  removePostEverywhere: (postId) => col('albums').updateMany({}, { $pull: { postIds: toId(postId) } }),
};
