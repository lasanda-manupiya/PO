import { getDb } from '../db/database.js';

export async function summaryReport(_req, res, next) {
  try {
    const db = await getDb();

    const byProject = await db.all(
      `SELECT p.id, p.name,
              COUNT(DISTINCT po.id) AS po_count,
              COALESCE(SUM(i.total_price), 0) AS total_amount
       FROM projects p
       LEFT JOIN purchase_orders po ON po.project_id = p.id
       LEFT JOIN po_items i ON i.po_id = po.id
       GROUP BY p.id, p.name
       ORDER BY total_amount DESC`
    );

    const byUser = await db.all(
      `SELECT u.id, u.name,
              COUNT(DISTINCT p.id) AS project_count,
              COUNT(DISTINCT po.id) AS po_count,
              COALESCE(SUM(i.total_price), 0) AS total_amount
       FROM users u
       LEFT JOIN projects p ON p.user_id = u.id
       LEFT JOIN purchase_orders po ON po.project_id = p.id
       LEFT JOIN po_items i ON i.po_id = po.id
       GROUP BY u.id, u.name
       ORDER BY total_amount DESC`
    );

    res.json({ by_project: byProject, by_user: byUser });
  } catch (error) {
    next(error);
  }
}
