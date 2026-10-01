const { ObjectId } = require('mongodb');
const { getDb } = require('./connection');

const col = (name) => getDb().collection(name);

function toId(value) {
  if (value instanceof ObjectId) return value;
  return /^[a-f\d]{24}$/i.test(String(value)) ? new ObjectId(String(value)) : null;
}

module.exports = { col, toId, ObjectId };
