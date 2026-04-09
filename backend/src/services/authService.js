import crypto from 'crypto';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function fromBase64Url(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function toBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

export function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export function verifyPassword(password, passwordHash) {
  return new Promise((resolve, reject) => {
    if (!passwordHash || !passwordHash.includes(':')) return resolve(false);
    const [salt, key] = passwordHash.split(':');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });
}

function signingSecret() {
  return process.env.AUTH_SECRET || 'development-secret-change-me';
}

export function createToken(userId) {
  const payload = JSON.stringify({ userId, exp: Date.now() + SESSION_TTL_MS, nonce: crypto.randomUUID() });
  const encodedPayload = toBase64Url(payload);
  const signature = crypto.createHmac('sha256', signingSecret()).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function parseToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', signingSecret()).update(encodedPayload).digest('base64url');
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (_error) {
    return null;
  }
}
