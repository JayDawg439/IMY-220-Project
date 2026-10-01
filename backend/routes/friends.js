const router = require('express').Router();
const users = require('../db/users');
const friendRequests = require('../db/friendRequests');
const { toId } = require('../db/helpers');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/errors');
const { publicUser } = require('../utils/serializers');

router.use(requireAuth);

async function loadTarget(req) {
  if (!toId(req.params.userId)) throw new HttpError(400, 'Invalid user id.');
  if (String(req.user._id) === req.params.userId) throw new HttpError(400, 'You cannot do that to yourself.');
  const target = await users.findById(req.params.userId);
  if (!target) throw new HttpError(404, 'User not found.');
  return target;
}

const areFriends = (user, otherId) => (user.friends || []).some((id) => String(id) === String(otherId));

router.get('/requests', async (req, res) => {
  const requests = await friendRequests.incoming(req.user._id);
  const senders = await users.findByIds(requests.map((r) => r.from));
  const map = new Map(senders.map((s) => [String(s._id), s]));
  res.json({ requests: requests.map((r) => ({ id: String(r._id), from: publicUser(map.get(String(r.from))), createdAt: r.createdAt })) });
});

router.post('/request/:userId', async (req, res) => {
  const target = await loadTarget(req);
  if (areFriends(req.user, target._id)) throw new HttpError(400, 'You are already friends.');
  if (await friendRequests.find(req.user._id, target._id)) throw new HttpError(400, 'Friend request already sent.');

  if (await friendRequests.find(target._id, req.user._id)) {
    await friendRequests.removeBetween(req.user._id, target._id);
    await users.addFriend(req.user._id, target._id);
    return res.json({ message: 'You are now friends.', friendStatus: 'friends' });
  }

  await friendRequests.create(req.user._id, target._id);
  res.status(201).json({ message: 'Friend request sent.', friendStatus: 'pending_sent' });
});

router.post('/accept/:userId', async (req, res) => {
  const sender = await loadTarget(req);
  if (!(await friendRequests.find(sender._id, req.user._id))) throw new HttpError(404, 'No friend request from this user.');
  await friendRequests.removeBetween(sender._id, req.user._id);
  await users.addFriend(req.user._id, sender._id);
  res.json({ message: 'Friend request accepted.', friendStatus: 'friends' });
});

router.post('/decline/:userId', async (req, res) => {
  const sender = await loadTarget(req);
  await friendRequests.remove(sender._id, req.user._id);
  res.json({ message: 'Friend request declined.', friendStatus: 'none' });
});

router.delete('/:userId', async (req, res) => {
  const target = await loadTarget(req);
  await users.removeFriend(req.user._id, target._id);
  await friendRequests.removeBetween(req.user._id, target._id);
  res.json({ message: 'Removed.', friendStatus: 'none' });
});

module.exports = router;
