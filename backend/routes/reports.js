const router = require('express').Router();
const users = require('../db/users');
const posts = require('../db/posts');
const reports = require('../db/reports');
const { toId } = require('../db/helpers');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { HttpError } = require('../utils/errors');
const { publicUser } = require('../utils/serializers');
const { requireString } = require('../utils/validate');

router.use(requireAuth);

const serializeReason = (r) => ({ id: String(r._id), label: r.label });

router.get('/reasons', async (req, res) => {
	res.json({ reasons: (await reports.listReasons()).map(serializeReason) });
});

router.post('/reasons', requireAdmin, async (req, res) => {
	const label = requireString(req.body?.label, 'Reason', { max: 60 });
	if(await reports.findReason(label)){
		throw new HttpError(409, 'That reason already exists.');
	}
	const created = await reports.createReason(label);
	res.status(201).json({ reason: serializeReason(created) });
});

router.delete('/reasons/:id', requireAdmin, async (req, res) => {
	if(!toId(req.params.id)){
		throw new HttpError(400, 'Invalid reason id.');
	}
	await reports.removeReason(req.params.id);
	res.json({ message: 'Reason removed.' });
});

router.get('/', requireAdmin, async (req, res) => {
	const list = await reports.list();
	const reporters = await users.findByIds([...new Set(list.map((r) => String(r.reporterId)))].map(toId));
	const reporterMap = new Map(reporters.map((u) => [String(u._id), u]));
	const postList = await posts.findByIds([...new Set(list.map((r) => String(r.postId)))].map(toId));
	const postMap = new Map(postList.map((p) => [String(p._id), p]));

	res.json({
		reports: list.map((r) => {
			const post = postMap.get(String(r.postId));
			return {
				id: String(r._id),
				reason: r.reason,
				details: r.details,
				createdAt: r.createdAt,
				reporter: publicUser(reporterMap.get(String(r.reporterId))),
				post: post ? { id: String(post._id), caption: post.caption, imageUrl: `/api/posts/${post._id}/image` } : null,
			};
		}),
	});
});

router.delete('/:id', requireAdmin, async (req, res) => {
	if(!toId(req.params.id)){
		throw new HttpError(400, 'Invalid report id.');
	}
	await reports.remove(req.params.id);
	res.json({ message: 'Report dismissed.' });
});

module.exports = router;
