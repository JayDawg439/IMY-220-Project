const router = require('express').Router();
const users = require('../db/users');
const posts = require('../db/posts');
const albums = require('../db/albums');
const friendRequests = require('../db/friendRequests');
const cleanup = require('../db/cleanup');
const { toId } = require('../db/helpers');
const { requireAuth, requireAdmin, canModify } = require('../middleware/auth');
const { HttpError } = require('../utils/errors');
const { publicUser, selfUser } = require('../utils/serializers');
const { sendDataUrl, sendFallbackAvatar } = require('../utils/images');
const { EMAIL_REGEX, USERNAME_REGEX, requireImage, optionalString } = require('../utils/validate');

router.get('/:id/avatar', async (req, res) => {
	const user = toId(req.params.id) && (await users.getAvatar(req.params.id));
	if(!user){
		return sendFallbackAvatar(res, '?');
	}
	if(user.avatarData){
		return sendDataUrl(res, user.avatarData);
	}
	return sendFallbackAvatar(res, user.name || user.username);
});

router.use(requireAuth);

router.get('/', requireAdmin, async (req, res) => {
	const list = await users.list(req.query.q);
	res.json({ users: list.map(publicUser) });
});

router.get('/:id', async (req, res) => {
	if(!toId(req.params.id)){
		throw new HttpError(400, 'Invalid user id.');
	}
	const user = await users.findById(req.params.id);
	if(!user){
		throw new HttpError(404, 'User not found.');
	}

	const me = req.user;
	const isSelf = String(me._id) === String(user._id);
	const isFriend = (me.friends || []).some((id) => String(id) === String(user._id));

	let friendStatus = 'none';
	if(isSelf){
		friendStatus = 'self';
	} else if(isFriend){
		friendStatus = 'friends';
	} else if(await friendRequests.find(me._id, user._id)){
		friendStatus = 'pending_sent';
	} else if(await friendRequests.find(user._id, me._id)){
		friendStatus = 'pending_received';
	}

	const friends = await users.findByIds(user.friends || []);
	const [postCount, albumList] = await Promise.all([
		posts.countByAuthor(user._id),
		albums.list({ ownerId: user._id }),
	]);

	res.json({
		user: isSelf || me.role === 'admin' ? selfUser(user) : publicUser(user),
		friends: friends.map(publicUser),
		postCount,
		albumCount: albumList.length,
		friendStatus,
	});
});

router.put('/:id', async (req, res) => {
	if(!toId(req.params.id)){
		throw new HttpError(400, 'Invalid user id.');
	}
	if(!canModify(req.user, req.params.id)){
		throw new HttpError(403, 'You can only edit your own profile.');
	}
	const user = await users.findById(req.params.id);
	if(!user){
		throw new HttpError(404, 'User not found.');
	}

	const body = req.body || {};
	const fields = {};

	if(body.name !== undefined){
		fields.name = optionalString(body.name, 'Name', 60);
		if(!fields.name){
			throw new HttpError(400, 'Name cannot be empty.');
		}
	}
	if(body.pronouns !== undefined){
		fields.pronouns = optionalString(body.pronouns, 'Pronouns', 30);
	}
	if(body.bio !== undefined){
		fields.bio = optionalString(body.bio, 'Bio', 300);
	}
	if(body.links !== undefined){
		fields.links = optionalString(body.links, 'Links', 200);
	}

	if(body.username !== undefined && body.username !== user.username){
		if(!USERNAME_REGEX.test(body.username)){
			throw new HttpError(400, 'Username must be 3-20 characters (letters, numbers, underscores).');
		}
		const taken = await users.findByUsername(body.username);
		if(taken && String(taken._id) !== String(user._id)){
			throw new HttpError(409, 'That username is taken.');
		}
		fields.username = body.username;
		fields.usernameLower = body.username.toLowerCase();
	}
	if(body.email !== undefined && body.email.toLowerCase() !== user.email){
		if(!EMAIL_REGEX.test(body.email)){
			throw new HttpError(400, 'Enter a valid email address.');
		}
		const taken = await users.findByEmail(body.email);
		if(taken && String(taken._id) !== String(user._id)){
			throw new HttpError(409, 'That email is already in use.');
		}
		fields.email = body.email.toLowerCase();
	}
	if(body.avatar){
		fields.avatarData = requireImage(body.avatar, 'avatar');
	}

	await users.update(user._id, fields);
	const updated = await users.findById(user._id);
	res.json({ message: 'Profile updated.', user: selfUser(updated) });
});

router.delete('/:id', async (req, res) => {
	if(!toId(req.params.id)){
		throw new HttpError(400, 'Invalid user id.');
	}
	if(!canModify(req.user, req.params.id)){
		throw new HttpError(403, 'You can only delete your own profile.');
	}
	const user = await users.findById(req.params.id);
	if(!user){
		throw new HttpError(404, 'User not found.');
	}
	await cleanup.deleteUser(user._id);
	res.json({ message: 'Profile deleted.' });
});

module.exports = router;
