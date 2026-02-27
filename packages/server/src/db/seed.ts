import { initDb, queryAll, execute } from './connection.js';
import { DEFAULT_CATEGORIES } from '@skill-store/shared';

async function seed() {
  await initDb();

  for (const cat of DEFAULT_CATEGORIES) {
    execute(
      `INSERT OR IGNORE INTO categories (name, label, icon, sort_order) VALUES (?, ?, ?, ?)`,
      [cat.name, cat.label, cat.icon, cat.sort_order]
    );
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

seed().catch(console.error);
