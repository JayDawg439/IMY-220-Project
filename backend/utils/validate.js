const { HttpError } = require('./errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const IMAGE_REGEX = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseHashtags(input) {
  if (input === undefined || input === null) return [];
  const parts = Array.isArray(input) ? input : String(input).split(/[\s,]+/);
  const tags = parts
    .map((t) => String(t).trim().replace(/^#+/, '').toLowerCase())
    .filter((t) => /^[a-z0-9_]{1,30}$/.test(t));
  return [...new Set(tags)].slice(0, 15);
}

function requireString(value, field, { min = 1, max = 500 } = {}) {
  if (typeof value !== 'string' || value.trim().length < min) {
    throw new HttpError(400, `${field} is required${min > 1 ? ` (min ${min} characters)` : ''}.`);
  }
  if (value.trim().length > max) {
    throw new HttpError(400, `${field} must be at most ${max} characters.`);
  }
  return value.trim();
}

function optionalString(value, field, max = 500) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text.`);
  if (value.trim().length > max) throw new HttpError(400, `${field} must be at most ${max} characters.`);
  return value.trim();
}

function requireImage(value, field = 'image') {
  if (typeof value !== 'string' || !IMAGE_REGEX.test(value)) {
    throw new HttpError(400, `A valid ${field} (png, jpeg, webp or gif) is required.`);
  }
  return value;
}

module.exports = {
  EMAIL_REGEX, USERNAME_REGEX, escapeRegex, parseHashtags,
  requireString, optionalString, requireImage,
};
