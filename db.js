import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function openDB(name) {
  // Use JSON file for storage
  const file = join(__dirname, `${name}.json`);
  const adapter = new JSONFile(file);
  const db = new Low(adapter);
  // Read data from JSON file, this will set db.data content
  await db.read();
  db.data = db.data || { [name]: [] };
  return db;
}
