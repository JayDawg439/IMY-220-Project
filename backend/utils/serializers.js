const stamp = (d) => (d ? new Date(d).getTime() : 0);

function publicUser(u) {
	if(!u){
		return { id: null, username: 'deleted', name: 'Deleted user', pronouns: '', avatarUrl: null };
	}
	return {
		id: String(u._id),
		username: u.username,
		name: u.name,
		pronouns: u.pronouns || '',
		bio: u.bio || '',
		links: u.links || '',
		role: u.role,
		avatarUrl: `/api/users/${u._id}/avatar?v=${stamp(u.updatedAt)}`,
		createdAt: u.createdAt,
	};
}

const selfUser = (u) => ({ ...publicUser(u), email: u.email });

function serializePost(p, author, commentCount, viewer) {
	const likes = p.likes || [];
	return {
		id: String(p._id),
		caption: p.caption,
		hashtags: p.hashtags || [],
		imageUrl: `/api/posts/${p._id}/image?v=${stamp(p.updatedAt || p.createdAt)}`,
		author: publicUser(author),
		likeCount: likes.length,
		liked: viewer ? likes.some((id) => String(id) === String(viewer._id)) : false,
		commentCount: commentCount || 0,
		createdAt: p.createdAt,
		updatedAt: p.updatedAt,
	};
}

function serializeComment(c, author) {
	return { id: String(c._id), postId: String(c.postId), text: c.text, author: publicUser(author), createdAt: c.createdAt };
}

function serializeAlbum(a, owner, coverPostId) {
	return {
		id: String(a._id),
		name: a.name,
		description: a.description,
		hashtags: a.hashtags || [],
		owner: publicUser(owner),
		postCount: (a.postIds || []).length,
		coverUrl: coverPostId ? `/api/posts/${coverPostId}/image` : null,
		createdAt: a.createdAt,
	};
}

module.exports = { publicUser, selfUser, serializePost, serializeComment, serializeAlbum };
