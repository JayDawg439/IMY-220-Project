const { col, toId } = require('./helpers');

module.exports = {
  async create({ postId, authorId, text }) {
    const doc = { postId: toId(postId), authorId: toId(authorId), text, createdAt: new Date() };
    const result = await col('comments').insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },
  findById: (id) => col('comments').findOne({ _id: toId(id) }),
  listForPost: (postId) => col('comments').find({ postId: toId(postId) }).sort({ createdAt: 1 }).toArray(),
  remove: (id) => col('comments').deleteOne({ _id: toId(id) }),
  removeForPost: (postId) => col('comments').deleteMany({ postId: toId(postId) }),
  removeByAuthor: (authorId) => col('comments').deleteMany({ authorId: toId(authorId) }),
  async countByPosts(postIds) {
    const rows = await col('comments').find({ postId: { $in: postIds } }, { projection: { postId: 1 } }).toArray();
    const counts = {};
    for (const r of rows) counts[String(r.postId)] = (counts[String(r.postId)] || 0) + 1;
    return counts;
  },
};
