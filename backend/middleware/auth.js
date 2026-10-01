const jwt = require('jsonwebtoken');
const users = require('../db/users');
const { HttpError } = require('../utils/errors');

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

const signToken = (userId) => jwt.sign({ sub: String(userId) }, JWT_SECRET(), { expiresIn: '7d' });

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'You need to be logged in.');

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET());
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.');
  }

  const user = await users.findById(payload.sub);
  if (!user) throw new HttpError(401, 'This account no longer exists.');
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') throw new HttpError(403, 'Admins only.');
  next();
}

const canModify = (user, ownerId) => user.role === 'admin' || String(user._id) === String(ownerId);

module.exports = { requireAuth, requireAdmin, canModify, signToken };
