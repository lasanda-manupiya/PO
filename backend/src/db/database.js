import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { hashPassword } from '../services/authService.js';

let db;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.resolve(process.cwd(), 'data.sqlite'),
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');
  await initializeSchema(db);
  await seedData(db);

  return db;
}

async function ensureUsersColumns(database) {
  const columns = await database.all('PRAGMA table_info(users)');
  const hasPasswordHash = columns.some((column) => column.name === 'password_hash');

  if (!hasPasswordHash) {
    await database.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }
}

async function initializeSchema(database) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'requester',
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      start_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      po_number TEXT NOT NULL UNIQUE,
      requested_by INTEGER NOT NULL,
      approved_by INTEGER,
      supplier_name TEXT NOT NULL,
      request_date TEXT NOT NULL,
      approval_date TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (requested_by) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS po_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      category TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS approval_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      comments TEXT,
      action_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await ensureUsersColumns(database);
}

async function seedData(database) {
  const userCount = await database.get('SELECT COUNT(*) AS count FROM users');
  if (userCount.count > 0) return;

  const alicePassword = await hashPassword('alice123');
  const bobPassword = await hashPassword('bob123');
  const caraPassword = await hashPassword('cara123');

  await database.run(
    `INSERT INTO users (name, email, role, password_hash) VALUES
      ('Alice Manager', 'alice@example.com', 'manager', ?),
      ('Bob Requester', 'bob@example.com', 'requester', ?),
      ('Cara Approver', 'cara@example.com', 'approver', ?)`,
    [alicePassword, bobPassword, caraPassword]
  );

  await database.run(
    `INSERT INTO projects (user_id, name, status, start_date) VALUES
      (1, 'HQ Renovation', 'active', '2026-01-10'),
      (2, 'Factory Expansion', 'active', '2026-02-15')`
  );

  await database.run(
    `INSERT INTO purchase_orders (project_id, po_number, requested_by, supplier_name, request_date, status)
      VALUES (1, 'PO-2026-0001', 2, 'BuildCo Supplies', '2026-03-05', 'submitted')`
  );

  await database.run(
    `INSERT INTO po_items (po_id, item_name, description, quantity, unit, unit_price, total_price, category, location, status)
      VALUES
      (1, 'Cement Bags', 'High-strength cement', 100, 'bag', 9.5, 950, 'Construction', 'Warehouse A', 'pending'),
      (1, 'Steel Rods', 'TMT steel rods', 50, 'bundle', 120, 6000, 'Construction', 'Warehouse A', 'pending')`
  );

  await database.run(
    `INSERT INTO approval_logs (po_id, action, user_id, comments)
      VALUES (1, 'submitted', 2, 'Initial PO submitted for review')`
  );
}
