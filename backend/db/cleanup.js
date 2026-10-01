const users = require('./users');
const posts = require('./posts');
const comments = require('./comments');
const albums = require('./albums');
const reports = require('./reports');
const friendRequests = require('./friendRequests');

async function deletePost(postId) {
	await comments.removeForPost(postId);
	await reports.removeForPost(postId);
	await albums.removePostEverywhere(postId);
	await posts.remove(postId);
}

async function deleteUser(userId) {
	const owned = await posts.find({ authorId: userId }, 1000);
	for (const post of owned) await deletePost(post._id);
	await comments.removeByAuthor(userId);
	await reports.removeByReporter(userId);
	await albums.removeByOwner(userId);
	await friendRequests.removeAllFor(userId);
	await posts.removeLikesBy(userId);
	await users.removeFriendEverywhere(userId);
	await users.remove(userId);
}

module.exports = { deletePost, deleteUser };
