import { getDb } from '../db/database.js';

function sanitizeUser(user) {
  const { password_hash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function listUsers(_req, res, next) {
  try {
    const db = await getDb();
    const users = await db.all('SELECT * FROM users ORDER BY id');
    res.json(users.map(sanitizeUser));
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, role = 'requester' } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'name and email are required' });

    const db = await getDb();
    const result = await db.run('INSERT INTO users (name, email, role) VALUES (?, ?, ?)', [name, email, role]);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
}
