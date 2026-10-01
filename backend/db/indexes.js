const { col } = require('./helpers');

async function ensureIndexes() {
	await col('users').createIndex({ usernameLower: 1 }, { unique: true });
	await col('users').createIndex({ email: 1 }, { unique: true });
	await col('posts').createIndex({ authorId: 1, createdAt: -1 });
	await col('posts').createIndex({ createdAt: -1 });
	await col('comments').createIndex({ postId: 1, createdAt: 1 });
	await col('albums').createIndex({ ownerId: 1 });
	await col('friendRequests').createIndex({ from: 1, to: 1 }, { unique: true });
	await col('reportReasons').createIndex({ labelLower: 1 }, { unique: true });
}

module.exports = { ensureIndexes };
