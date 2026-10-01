const router = require('express').Router();
const users = require('../db/users');
const posts = require('../db/posts');
const comments = require('../db/comments');
const reports = require('../db/reports');
const cleanup = require('../db/cleanup');
const { toId } = require('../db/helpers');
const { requireAuth, canModify } = require('../middleware/auth');
const { HttpError } = require('../utils/errors');
const { serializePost, serializeComment } = require('../utils/serializers');
const { sendDataUrl } = require('../utils/images');
const { escapeRegex, parseHashtags, requireImage, optionalString, requireString } = require('../utils/validate');

router.get('/:id/image', async (req, res) => {
  const post = toId(req.params.id) && (await posts.getImage(req.params.id));
  if (!post) return res.status(404).json({ error: 'Image not found.' });
  return sendDataUrl(res, post.imageData);
});

router.use(requireAuth);

async function enrich(list, viewer) {
  const authorIds = [...new Set(list.map((p) => String(p.authorId)))].map(toId);
  const authors = await users.findByIds(authorIds);
  const authorMap = new Map(authors.map((a) => [String(a._id), a]));
  const counts = await comments.countByPosts(list.map((p) => p._id));
  return list.map((p) => serializePost(p, authorMap.get(String(p.authorId)), counts[String(p._id)], viewer));
}

async function loadPost(id) {
  if (!toId(id)) throw new HttpError(400, 'Invalid post id.');
  const post = await posts.findById(id);
  if (!post) throw new HttpError(404, 'Post not found.');
  return post;
}

router.get('/', async (req, res) => {
  const { feed = 'global', q, author } = req.query;
  const filter = {};

  if (author) {
    const authorId = toId(author);
    if (!authorId) throw new HttpError(400, 'Invalid author id.');
    filter.authorId = authorId;
  } else if (feed === 'local') {
    filter.authorId = { $in: [req.user._id, ...(req.user.friends || [])] };
  } else if (feed !== 'global') {
    throw new HttpError(400, 'feed must be "local" or "global".');
  }

  if (q && String(q).trim()) {
    const term = String(q).trim().replace(/^#/, '');
    const rx = new RegExp(escapeRegex(term), 'i');
    const matchedUsers = await users.list(term);
    filter.$or = [{ caption: rx }, { hashtags: rx }, { authorId: { $in: matchedUsers.map((u) => u._id) } }];
  }

  const list = await posts.find(filter);
  res.json({ posts: await enrich(list, req.user) });
});

router.post('/', async (req, res) => {
  const { image, caption, hashtags } = req.body || {};
  const post = await posts.create({
    authorId: req.user._id,
    imageData: requireImage(image),
    caption: optionalString(caption, 'Caption', 500),
    hashtags: parseHashtags(hashtags),
  });
  const [out] = await enrich([await posts.findById(post._id)], req.user);
  res.status(201).json({ message: 'Post created.', post: out });
});

router.get('/:id', async (req, res) => {
  const post = await loadPost(req.params.id);
  const [out] = await enrich([post], req.user);
  res.json({ post: out });
});

router.put('/:id', async (req, res) => {
  const post = await loadPost(req.params.id);
  if (!canModify(req.user, post.authorId)) throw new HttpError(403, 'You can only edit your own posts.');

  const { caption, hashtags, image } = req.body || {};
  const fields = {};
  if (caption !== undefined) fields.caption = optionalString(caption, 'Caption', 500);
  if (hashtags !== undefined) fields.hashtags = parseHashtags(hashtags);
  if (image) fields.imageData = requireImage(image);

  await posts.update(post._id, fields);
  const [out] = await enrich([await posts.findById(post._id)], req.user);
  res.json({ message: 'Post updated.', post: out });
});

router.delete('/:id', async (req, res) => {
  const post = await loadPost(req.params.id);
  if (!canModify(req.user, post.authorId)) throw new HttpError(403, 'You can only delete your own posts.');
  await cleanup.deletePost(post._id);
  res.json({ message: 'Post deleted.' });
});

router.post('/:id/like', async (req, res) => {
  const post = await loadPost(req.params.id);
  const liked = (post.likes || []).some((id) => String(id) === String(req.user._id));
  if (liked) await posts.unlike(post._id, req.user._id);
  else await posts.like(post._id, req.user._id);
  const [out] = await enrich([await posts.findById(post._id)], req.user);
  res.json({ post: out });
});

router.get('/:id/comments', async (req, res) => {
  const post = await loadPost(req.params.id);
  const list = await comments.listForPost(post._id);
  const authors = await users.findByIds([...new Set(list.map((c) => String(c.authorId)))].map(toId));
  const map = new Map(authors.map((a) => [String(a._id), a]));
  res.json({ comments: list.map((c) => serializeComment(c, map.get(String(c.authorId)))) });
});

router.post('/:id/comments', async (req, res) => {
  const post = await loadPost(req.params.id);
  const text = requireString(req.body?.text, 'Comment', { max: 300 });
  const created = await comments.create({ postId: post._id, authorId: req.user._id, text });
  res.status(201).json({ comment: serializeComment(created, req.user) });
});

router.delete('/:id/comments/:commentId', async (req, res) => {
  const post = await loadPost(req.params.id);
  if (!toId(req.params.commentId)) throw new HttpError(400, 'Invalid comment id.');
  const comment = await comments.findById(req.params.commentId);
  if (!comment || String(comment.postId) !== String(post._id)) throw new HttpError(404, 'Comment not found.');
  if (!canModify(req.user, comment.authorId) && String(post.authorId) !== String(req.user._id)) {
    throw new HttpError(403, 'You cannot delete this comment.');
  }
  await comments.remove(comment._id);
  res.json({ message: 'Comment deleted.' });
});

router.post('/:id/report', async (req, res) => {
  const post = await loadPost(req.params.id);
  if (String(post.authorId) === String(req.user._id)) throw new HttpError(400, 'You cannot report your own post.');

  const reason = requireString(req.body?.reason, 'Reason', { max: 100 });
  const valid = await reports.findReason(reason);
  if (!valid) throw new HttpError(400, 'Please choose one of the listed reasons.');
  if (await reports.find(post._id, req.user._id)) throw new HttpError(409, 'You have already reported this post.');

  await reports.create({
    postId: post._id,
    reporterId: req.user._id,
    reason: valid.label,
    details: optionalString(req.body?.details, 'Details', 300),
  });
  res.status(201).json({ message: 'Report submitted. Thank you.' });
});

module.exports = router;
