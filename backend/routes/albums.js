const router = require('express').Router();
const users = require('../db/users');
const posts = require('../db/posts');
const albums = require('../db/albums');
const comments = require('../db/comments');
const { toId } = require('../db/helpers');
const { requireAuth, canModify } = require('../middleware/auth');
const { HttpError } = require('../utils/errors');
const { serializeAlbum, serializePost } = require('../utils/serializers');
const { parseHashtags, optionalString, requireString } = require('../utils/validate');

router.use(requireAuth);

async function loadAlbum(id) {
	if(!toId(id)){
		throw new HttpError(400, 'Invalid album id.');
	}
	const album = await albums.findById(id);
	if(!album){
		throw new HttpError(404, 'Album not found.');
	}
	return album;
}

async function ownersFor(list) {
	const owners = await users.findByIds([...new Set(list.map((a) => String(a.ownerId)))].map(toId));
	return new Map(owners.map((o) => [String(o._id), o]));
}

async function albumWithPosts(album, viewer) {
	const owner = (await ownersFor([album]))?.get(String(album.ownerId));
	const found = await posts.findByIds(album.postIds || []);
	const byId = new Map(found.map((p) => [String(p._id), p]));
	const ordered = (album.postIds || []).map((id) => byId.get(String(id))).filter(Boolean);

	const authors = await users.findByIds([...new Set(ordered.map((p) => String(p.authorId)))].map(toId));
	const authorMap = new Map(authors.map((a) => [String(a._id), a]));
	const counts = await comments.countByPosts(ordered.map((p) => p._id));

	const cover = ordered[0]?._id;
	return {
		...serializeAlbum(album, owner, cover),
		posts: ordered.map((p) => serializePost(p, authorMap.get(String(p.authorId)), counts[String(p._id)], viewer)),
	};
}

router.get('/', async (req, res) => {
	const filter = {};
	if(req.query.owner){
		if(!toId(req.query.owner)){
			throw new HttpError(400, 'Invalid owner id.');
		}
		filter.ownerId = toId(req.query.owner);
	}
	const list = await albums.list(filter);
	const owners = await ownersFor(list);
	res.json({ albums: list.map((a) => serializeAlbum(a, owners.get(String(a.ownerId)), a.postIds?.[0])) });
});

router.post('/', async (req, res) => {
	const { name, description, hashtags } = req.body || {};
	const album = await albums.create({
		ownerId: req.user._id,
		name: requireString(name, 'Album name', { max: 80 }),
		description: optionalString(description, 'Description', 500),
		hashtags: parseHashtags(hashtags),
	});
	res.status(201).json({ message: 'Album created.', album: serializeAlbum(album, req.user, null) });
});

router.get('/:id', async (req, res) => {
	const album = await loadAlbum(req.params.id);
	res.json({ album: await albumWithPosts(album, req.user) });
});

router.put('/:id', async (req, res) => {
	const album = await loadAlbum(req.params.id);
	if(!canModify(req.user, album.ownerId)){
		throw new HttpError(403, 'You can only edit your own albums.');
	}

	const { name, description, hashtags } = req.body || {};
	const fields = {};
	if(name !== undefined){
		fields.name = requireString(name, 'Album name', { max: 80 });
	}
	if(description !== undefined){
		fields.description = optionalString(description, 'Description', 500);
	}
	if(hashtags !== undefined){
		fields.hashtags = parseHashtags(hashtags);
	}

	await albums.update(album._id, fields);
	res.json({ message: 'Album updated.', album: await albumWithPosts(await albums.findById(album._id), req.user) });
});

router.delete('/:id', async (req, res) => {
	const album = await loadAlbum(req.params.id);
	if(!canModify(req.user, album.ownerId)){
		throw new HttpError(403, 'You can only delete your own albums.');
	}
	await albums.remove(album._id);
	res.json({ message: 'Album deleted.' });
});

router.post('/:id/posts/:postId', async (req, res) => {
	const album = await loadAlbum(req.params.id);
	if(!canModify(req.user, album.ownerId)){
		throw new HttpError(403, 'You can only change your own albums.');
	}
	if(!toId(req.params.postId) || !(await posts.findById(req.params.postId))){
		throw new HttpError(404, 'Post not found.');
	}
	await albums.addPost(album._id, req.params.postId);
	res.json({ message: 'Post added to album.', album: await albumWithPosts(await albums.findById(album._id), req.user) });
});

router.delete('/:id/posts/:postId', async (req, res) => {
	const album = await loadAlbum(req.params.id);
	if(!canModify(req.user, album.ownerId)){
		throw new HttpError(403, 'You can only change your own albums.');
	}
	if(!toId(req.params.postId)){
		throw new HttpError(400, 'Invalid post id.');
	}
	await albums.removePost(album._id, req.params.postId);
	res.json({ message: 'Post removed from album.', album: await albumWithPosts(await albums.findById(album._id), req.user) });
});

module.exports = router;
