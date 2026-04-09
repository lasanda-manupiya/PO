import { getDb } from '../db/database.js';

function totalPrice(quantity, unitPrice) {
  return Number(quantity) * Number(unitPrice);
}

export async function listItemsByPurchaseOrder(req, res, next) {
  try {
    const db = await getDb();
    const items = await db.all('SELECT * FROM po_items WHERE po_id = ? ORDER BY id', [req.params.id]);
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    const { item_name, description = null, quantity, unit, unit_price, category = null, location = null, status = 'pending' } = req.body;
    if (!item_name || quantity == null || !unit || unit_price == null) {
      return res.status(400).json({ message: 'item_name, quantity, unit, and unit_price are required' });
    }

    const db = await getDb();
    const total = totalPrice(quantity, unit_price);

    const result = await db.run(
      `INSERT INTO po_items
       (po_id, item_name, description, quantity, unit, unit_price, total_price, category, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, item_name, description, quantity, unit, unit_price, total, category, location, status]
    );

    const item = await db.get('SELECT * FROM po_items WHERE id = ?', [result.lastID]);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const db = await getDb();
    const current = await db.get('SELECT * FROM po_items WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Item not found' });

    const merged = { ...current, ...req.body };
    const total = totalPrice(merged.quantity, merged.unit_price);

    await db.run(
      `UPDATE po_items
       SET item_name = ?, description = ?, quantity = ?, unit = ?, unit_price = ?, total_price = ?,
           category = ?, location = ?, status = ?
       WHERE id = ?`,
      [
        merged.item_name,
        merged.description,
        merged.quantity,
        merged.unit,
        merged.unit_price,
        total,
        merged.category,
        merged.location,
        merged.status,
        req.params.id,
      ]
    );

    const item = await db.get('SELECT * FROM po_items WHERE id = ?', [req.params.id]);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM po_items WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Item not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
