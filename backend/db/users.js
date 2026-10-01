const { col, toId } = require('./helpers');
const { escapeRegex } = require('../utils/validate');

const SAFE = { projection: { passwordHash: 0, avatarData: 0 } };

module.exports = {
  async create(data) {
    const now = new Date();
    const doc = {
      username: data.username,
      usernameLower: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name || data.username,
      pronouns: data.pronouns || '',
      bio: data.bio || '',
      links: data.links || '',
      avatarData: data.avatarData || null,
      role: data.role || 'user',
      friends: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await col('users').insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  findById: (id) => col('users').findOne({ _id: toId(id) }, SAFE),
  findByEmailWithHash: (email) => col('users').findOne({ email: String(email).toLowerCase() }, { projection: { avatarData: 0 } }),
  findByUsername: (username) => col('users').findOne({ usernameLower: String(username).toLowerCase() }, SAFE),
  findByEmail: (email) => col('users').findOne({ email: String(email).toLowerCase() }, SAFE),
  findByIds: (ids) => col('users').find({ _id: { $in: ids } }, SAFE).toArray(),
  getAvatar: (id) => col('users').findOne({ _id: toId(id) }, { projection: { avatarData: 1, name: 1, username: 1 } }),
  count: () => col('users').countDocuments(),

  list: (q) => {
    const filter = q ? { $or: [{ usernameLower: new RegExp(escapeRegex(q.toLowerCase())) }, { name: new RegExp(escapeRegex(q), 'i') }] } : {};
    return col('users').find(filter, SAFE).sort({ createdAt: 1 }).limit(100).toArray();
  },

  update(id, fields) {
    return col('users').updateOne({ _id: toId(id) }, { $set: { ...fields, updatedAt: new Date() } });
  },

  remove: (id) => col('users').deleteOne({ _id: toId(id) }),

  async addFriend(a, b) {
    await col('users').updateOne({ _id: toId(a) }, { $addToSet: { friends: toId(b) } });
    await col('users').updateOne({ _id: toId(b) }, { $addToSet: { friends: toId(a) } });
  },
  async removeFriend(a, b) {
    await col('users').updateOne({ _id: toId(a) }, { $pull: { friends: toId(b) } });
    await col('users').updateOne({ _id: toId(b) }, { $pull: { friends: toId(a) } });
  },
  removeFriendEverywhere: (id) => col('users').updateMany({}, { $pull: { friends: toId(id) } }),
};
