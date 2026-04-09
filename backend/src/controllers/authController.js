import { getDb } from '../db/database.js';
import { createToken, hashPassword, verifyPassword } from '../services/authService.js';

function sanitizeUser(userRow) {
  if (!userRow) return null;
  const { password_hash: _passwordHash, ...user } = userRow;
  return user;
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'requester' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    const passwordHash = await hashPassword(password);
    const result = await db.run(
      'INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, role, passwordHash]
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    const token = createToken(result.lastID);

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) return res.status(401).json({ message: 'Invalid email or password' });

    const token = createToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
