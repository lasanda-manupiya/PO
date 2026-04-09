import { getDb } from '../db/database.js';

function nextPoNumber() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `PO-${year}-${random}`;
}

export async function listPurchaseOrders(req, res, next) {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT po.*, p.name AS project_name
       FROM purchase_orders po
       JOIN projects p ON p.id = po.project_id
       WHERE p.user_id = ?
       ORDER BY po.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function createPurchaseOrder(req, res, next) {
  try {
    const {
      project_id,
      supplier_name,
      request_date = new Date().toISOString().slice(0, 10),
      status = 'draft',
      po_number = nextPoNumber(),
    } = req.body;

    if (!project_id || !supplier_name) {
      return res.status(400).json({ message: 'project_id and supplier_name are required' });
    }

    const db = await getDb();
    const project = await db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [project_id, req.user.id]);
    if (!project) return res.status(403).json({ message: 'Project access denied' });

    const result = await db.run(
      `INSERT INTO purchase_orders
       (project_id, po_number, requested_by, supplier_name, request_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [project_id, po_number, req.user.id, supplier_name, request_date, status]
    );

    const row = await db.get('SELECT * FROM purchase_orders WHERE id = ?', [result.lastID]);
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
}

export async function getPurchaseOrderById(req, res, next) {
  try {
    const db = await getDb();
    const po = await db.get(
      `SELECT po.*
       FROM purchase_orders po
       JOIN projects p ON p.id = po.project_id
       WHERE po.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });

    const items = await db.all('SELECT * FROM po_items WHERE po_id = ?', [req.params.id]);
    const approvals = await db.all('SELECT * FROM approval_logs WHERE po_id = ? ORDER BY action_date DESC', [req.params.id]);
    res.json({ ...po, items, approvals });
  } catch (error) {
    next(error);
  }
}

export async function listPurchaseOrdersByProject(req, res, next) {
  try {
    const db = await getDb();
    const project = await db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!project) return res.status(403).json({ message: 'Project access denied' });

    const rows = await db.all('SELECT * FROM purchase_orders WHERE project_id = ? ORDER BY id DESC', [req.params.id]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function updatePurchaseOrderStatus(req, res, next) {
  try {
    const { status, approved_by = null, comments = null } = req.body;
    if (!status) return res.status(400).json({ message: 'status is required' });

    const db = await getDb();
    const existing = await db.get(
      `SELECT po.*
       FROM purchase_orders po
       JOIN projects p ON p.id = po.project_id
       WHERE po.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ message: 'Purchase order not found' });

    const approvalDate = status === 'approved' ? new Date().toISOString().slice(0, 10) : null;
    await db.run(
      'UPDATE purchase_orders SET status = ?, approved_by = COALESCE(?, approved_by), approval_date = ? WHERE id = ?',
      [status, approved_by, approvalDate, req.params.id]
    );

    if (approved_by) {
      await db.run(
        'INSERT INTO approval_logs (po_id, action, user_id, comments) VALUES (?, ?, ?, ?)',
        [req.params.id, status, approved_by, comments]
      );
    }

    const updated = await db.get('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
