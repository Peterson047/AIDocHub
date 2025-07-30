
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs/promises');
const path = require('path');

async function migrate() {
  const jsonPath = path.resolve(process.cwd(), 'src/data/technologies.json');
  const dbPath = path.resolve(process.cwd(), 'src/data/database.db');
  const dataDir = path.dirname(dbPath);

  console.log('Starting migration from JSON to SQLite...');

  try {
    // Ensure the data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Ensure the database file doesn't exist to start fresh
    try {
      await fs.unlink(dbPath);
      console.log('Removed existing database file.');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error; // Rethrow if it's not a "file not found" error
      }
    }

    // Open the database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Database opened successfully.');

    // Create the technologies table
    await db.exec(`
      CREATE TABLE technologies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        summary TEXT
      );
    `);

    console.log('Table "technologies" created.');

    // Read the JSON data
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const technologies = JSON.parse(jsonData);

    console.log(`Found ${technologies.length} technologies in the JSON file.`);

    // Prepare the insert statement
    const stmt = await db.prepare(
      'INSERT INTO technologies (id, name, category, description, image_url, summary) VALUES (?, ?, ?, ?, ?, ?)'
    );

    let insertedCount = 0;
    // Insert each technology into the database
    for (const tech of technologies) {
      await stmt.run(
        tech.id,
        tech.name,
        tech.category,
        tech.description,
        tech.image_url,
        tech.summary
      );
      insertedCount++;
    }

    // Finalize the statement
    await stmt.finalize();

    console.log(`Successfully inserted ${insertedCount} records into the database.`);

    // Close the database connection
    await db.close();
    console.log('Database connection closed.');
    console.log('Migration completed successfully!');

  } catch (err) {
    console.error('An error occurred during migration:', err);
  }
}

migrate();
