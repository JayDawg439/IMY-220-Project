require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connect } = require('./db/connection');
const { ensureIndexes } = require('./db/indexes');
const { seedIfEmpty } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '12mb' }));

app.get('/', (req, res) => res.send('Obscura Fulgur API running'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/reports', require('./routes/reports'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'That file is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  if (err.code === 11000) return res.status(409).json({ error: 'That value is already in use.' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on the server.' : err.message });
});

async function start() {
  await connect();
  await ensureIndexes();
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

module.exports = { app, start };
