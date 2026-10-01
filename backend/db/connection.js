const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function connect() {
  if (db) return db;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set. Add it to backend/.env');
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.DB_NAME || 'obscura');
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected yet');
  return db;
}

async function close() {
  if (client) await client.close();
  client = null;
  db = null;
}

module.exports = { connect, getDb, close };
