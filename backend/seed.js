// Seeds the database with demo data.
//   npm run seed        -> wipes the collections and re-inserts demo data
// The server also calls seedIfEmpty() on start, so a fresh database fills itself.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect, close, getDb } = require('./db/connection');
const { ensureIndexes } = require('./db/indexes');

const DEMO_PASSWORD = 'password123';

// Simple generated artwork so seed posts have images without needing files.
function artwork(title, c1, c2, c3) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="800" height="800" fill="url(#g)"/>
<circle cx="560" cy="250" r="120" fill="${c3}" opacity="0.85"/>
<path d="M0 620 L180 430 L330 560 L520 340 L800 640 L800 800 L0 800 Z" fill="#0d0d0d" opacity="0.8"/>
<text x="40" y="760" font-family="sans-serif" font-size="34" fill="#39ff14" letter-spacing="6">${title.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function seed({ reset = false } = {}) {
  const db = getDb();
  if (reset) {
    for (const name of ['users', 'posts', 'comments', 'albums', 'reports', 'reportReasons', 'friendRequests']) {
      await db.collection(name).deleteMany({});
    }
  }
  await ensureIndexes();

  const now = Date.now();
  const hours = (n) => new Date(now - n * 3600 * 1000);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const mkUser = (username, name, pronouns, bio, links, role = 'user') => ({
    username, usernameLower: username.toLowerCase(), email: `${username}@obscura.test`, passwordHash,
    name, pronouns, bio, links, avatarData: null, role, friends: [],
    createdAt: hours(500), updatedAt: hours(500),
  });

  const userDocs = [
    mkUser('admin', 'Site Admin', 'They/Them', 'Keeping the lights on.', '', 'admin'),
    mkUser('alex', 'Alex Rivera', 'He/Him', 'Capturing light where I find it. Film photography enthusiast.', 'alexrivera.photo'),
    mkUser('jane', 'Jane Doe', 'She/Her', 'City nights and long exposures.', 'janedoe.art'),
    mkUser('mike', 'Mike Chen', 'He/Him', 'Road trips, deserts, and bad coffee.', ''),
  ];
  const { insertedIds } = await db.collection('users').insertMany(userDocs);
  const [adminId, alexId, janeId, mikeId] = [0, 1, 2, 3].map((i) => insertedIds[i]);

  // Alex and Jane are friends; Mike has sent Alex a pending friend request.
  await db.collection('users').updateOne({ _id: alexId }, { $set: { friends: [janeId] } });
  await db.collection('users').updateOne({ _id: janeId }, { $set: { friends: [alexId] } });
  await db.collection('friendRequests').insertOne({ from: mikeId, to: alexId, createdAt: hours(3) });

  const mkPost = (authorId, title, caption, hashtags, colors, h) => ({
    authorId, imageData: artwork(title, ...colors), caption, hashtags, likes: [], createdAt: hours(h), updatedAt: hours(h),
  });
  const postDocs = [
    mkPost(alexId, 'sunset', 'Sunset over the mountains', ['sunset', 'film', 'mountains'], ['#ff7a18', '#af002d', '#ffd166'], 48),
    mkPost(alexId, 'ridge', 'Hiking the ridge trail', ['hiking', 'film'], ['#0f2027', '#2c5364', '#a8ff78'], 30),
    mkPost(janeId, 'city', 'City lights', ['city', 'night', 'longexposure'], ['#141e30', '#243b55', '#39ff14'], 24),
    mkPost(janeId, 'harbour', 'Harbour at dawn', ['dawn', 'harbour'], ['#355c7d', '#6c5b7b', '#f8b195'], 12),
    mkPost(mikeId, 'desert', 'Desert road trip', ['roadtrip', 'desert'], ['#f7971e', '#ffd200', '#c0392b'], 8),
    mkPost(mikeId, 'campfire', 'Campfire nights', ['camping', 'night'], ['#1d1d1d', '#434343', '#ff9a00'], 4),
  ];
  const postRes = await db.collection('posts').insertMany(postDocs);
  const p = [0, 1, 2, 3, 4, 5].map((i) => postRes.insertedIds[i]);

  await db.collection('posts').updateOne({ _id: p[0] }, { $set: { likes: [janeId, mikeId] } });
  await db.collection('posts').updateOne({ _id: p[2] }, { $set: { likes: [alexId] } });

  await db.collection('comments').insertMany([
    { postId: p[0], authorId: janeId, text: 'Beautiful shot!', createdAt: hours(40) },
    { postId: p[0], authorId: mikeId, text: 'Where is this?', createdAt: hours(36) },
    { postId: p[2], authorId: alexId, text: 'Love the colours here.', createdAt: hours(20) },
  ]);

  await db.collection('albums').insertMany([
    { ownerId: alexId, name: 'Mountain Days', description: 'Everything shot above 2000m.', hashtags: ['mountains', 'film'], postIds: [p[0], p[1]], createdAt: hours(28), updatedAt: hours(28) },
    { ownerId: janeId, name: 'After Dark', description: 'Cities and harbours.', hashtags: ['night', 'city'], postIds: [p[2]], createdAt: hours(18), updatedAt: hours(18) },
  ]);

  await db.collection('reportReasons').insertMany(
    ['Spam', 'Inappropriate content', 'Harassment', 'Copyright infringement', 'Other'].map((label) => ({
      label, labelLower: label.toLowerCase(), createdAt: hours(100),
    })),
  );

  return { adminId };
}

async function seedIfEmpty() {
  const count = await getDb().collection('users').countDocuments();
  if (count > 0) return false;
  console.log('Database is empty - seeding demo data...');
  await seed();
  console.log(`Seeded. Log in with e.g. alex@obscura.test / ${DEMO_PASSWORD}`);
  return true;
}

module.exports = { seed, seedIfEmpty, DEMO_PASSWORD };

if (require.main === module) {
  (async () => {
    await connect();
    await seed({ reset: true });
    console.log('Database seeded.');
    console.log('  admin@obscura.test  (admin)');
    console.log('  alex@obscura.test   (has friend: jane, pending request from mike)');
    console.log('  jane@obscura.test');
    console.log('  mike@obscura.test');
    console.log(`  password for all: ${DEMO_PASSWORD}`);
    await close();
  })().catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  });
}
