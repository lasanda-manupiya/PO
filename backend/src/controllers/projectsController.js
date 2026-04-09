import { getDb } from '../db/database.js';

export async function listProjects(_req, res, next) {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT p.*, u.name as owner_name
       FROM projects p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.id`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { user_id, name, status = 'active', start_date = null } = req.body;
    if (!user_id || !name) return res.status(400).json({ message: 'user_id and name are required' });

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO projects (user_id, name, status, start_date) VALUES (?, ?, ?, ?)',
      [user_id, name, status, start_date]
    );
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [result.lastID]);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const db = await getDb();
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function listProjectsByUser(req, res, next) {
  try {
    const db = await getDb();
    const projects = await db.all('SELECT * FROM projects WHERE user_id = ? ORDER BY id', [req.params.id]);
    res.json(projects);
  } catch (error) {
    next(error);
  }
}
