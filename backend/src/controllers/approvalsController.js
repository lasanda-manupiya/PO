import { getDb } from '../db/database.js';

export async function listApprovalsByPurchaseOrder(req, res, next) {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT a.*, u.name AS user_name
       FROM approval_logs a
       JOIN users u ON u.id = a.user_id
       WHERE a.po_id = ?
       ORDER BY a.action_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function createApprovalLog(req, res, next) {
  try {
    const { action, user_id, comments = null } = req.body;
    if (!action || !user_id) return res.status(400).json({ message: 'action and user_id are required' });

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO approval_logs (po_id, action, user_id, comments) VALUES (?, ?, ?, ?)',
      [req.params.id, action, user_id, comments]
    );

    if (action === 'approved' || action === 'rejected' || action === 'submitted') {
      await db.run('UPDATE purchase_orders SET status = ? WHERE id = ?', [action, req.params.id]);
    }

    const row = await db.get('SELECT * FROM approval_logs WHERE id = ?', [result.lastID]);
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
}
