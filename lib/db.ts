import Database from "better-sqlite3";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

const DB_PATH = path.join(process.cwd(), "lab.db");

function createConnection(): Database.Database {
  const db = new Database(DB_PATH);

  // WAL mode: allows concurrent readers without blocking writers.
  // Intentionally chosen for this lab — it widens the TOCTOU race
  // window so the exploit is reliably reproducible.
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initSchema(db);
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id      INTEGER PRIMARY KEY,
      name    TEXT    NOT NULL,
      price   REAL    NOT NULL,
      stock   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL REFERENCES products(id),
      buyer       TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed only if the product row doesn't exist yet.
  // Use /api/reset to explicitly restore stock between demos.
  const existing = db
    .prepare("SELECT id FROM products WHERE id = 1")
    .get() as { id: number } | undefined;

  if (!existing) {
    db.prepare(
      "INSERT INTO products (id, name, price, stock) VALUES (1, 'Limited Edition Sneaker', 199.99, 1)"
    ).run();
  }
}

// Singleton: reuse across hot-reloads in development.
const db: Database.Database =
  global.__db ?? (global.__db = createConnection());

export default db;
