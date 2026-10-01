const router = require('express').Router();
const bcrypt = require('bcryptjs');
const users = require('../db/users');
const { requireAuth, signToken } = require('../middleware/auth');
const { HttpError } = require('../utils/errors');
const { selfUser } = require('../utils/serializers');
const { EMAIL_REGEX, USERNAME_REGEX } = require('../utils/validate');

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!USERNAME_REGEX.test(username || '')) {
    throw new HttpError(400, 'Username must be 3-20 characters (letters, numbers, underscores).');
  }
  if (!EMAIL_REGEX.test(email || '')) throw new HttpError(400, 'Enter a valid email address.');
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters.');
  }

  if (await users.findByUsername(username)) throw new HttpError(409, 'That username is taken.');
  if (await users.findByEmail(email)) throw new HttpError(409, 'An account with that email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await users.create({ username, email, passwordHash });
  res.status(201).json({ message: 'Account created.', token: signToken(user._id), user: selfUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');

  const user = await users.findByEmailWithHash(email);
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!ok) throw new HttpError(401, 'Incorrect email or password.');

  res.json({ message: 'Login successful.', token: signToken(user._id), user: selfUser(user) });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out.' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: selfUser(req.user) });
});

module.exports = router;
