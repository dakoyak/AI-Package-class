const sqlite3 = require('sqlite3').verbose();
console.log('Trying to connect to SQLite...');
const db = new sqlite3.Database('./test.db', (err) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});
db.close();
