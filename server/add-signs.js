const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./signs.db');

// Add signs (without position - ESP32 will report its own position)
const signs = [
  {
    id: '1',
    name: '1'
  },
  {
    id: '2', 
    name: '2'
  },
  {
    id: '3',
    name: '3'
  }
];

console.log('Adding signs to database...');

db.serialize(() => {
// Create the table first
db.run(`CREATE TABLE IF NOT EXISTS signs (
  id TEXT PRIMARY KEY,
  name TEXT,
  position_lat REAL,
  position_lon REAL,
  heading INTEGER,
  status TEXT,
  battery INTEGER,
  signal INTEGER,
  last_seen TIMESTAMP,
  current_mode TEXT
)`);

  signs.forEach((sign, index) => {
    db.run(
      'INSERT OR REPLACE INTO signs (id, name, last_seen, status) VALUES (?, ?, datetime("now"), "offline")',
      [sign.id, sign.name],
      function(err) {
        if (err) {
          console.error(`Error adding sign ${sign.id}:`, err.message);
        } else {
          console.log(`✅ Added sign ${sign.id}: ${sign.name}`);
        }
        
        // Close database after last sign
        if (index === signs.length - 1) {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('Database connection closed.');
              console.log('All signs added successfully!');
            }
          });
        }
      }
    );
  });
});
