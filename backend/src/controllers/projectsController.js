import { getDb } from '../db/database.js';

export async function listProjects(req, res, next) {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT p.*, u.name as owner_name
       FROM projects p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
       ORDER BY p.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, status = 'active', start_date = null } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO projects (user_id, name, status, start_date) VALUES (?, ?, ?, ?)',
      [req.user.id, name, status, start_date]
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
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function listProjectsByUser(req, res, next) {
  try {
    if (Number(req.params.id) !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own projects' });
    }

    const db = await getDb();
    const projects = await db.all('SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC', [req.params.id]);
    res.json(projects);
  } catch (error) {
    next(error);
  }
}
