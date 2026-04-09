import { getDb } from '../db/database.js';
import { parseToken } from '../services/authService.js';

function getBearerToken(header = '') {
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization);
    const payload = parseToken(token);
    if (!payload) return res.status(401).json({ message: 'Authentication required' });

    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user) return res.status(401).json({ message: 'User account no longer exists' });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
