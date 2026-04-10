const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./users.db');

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )`);

  // Insert a sample user for testing
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'pass', 'admin')`);

  // Update password to ensure it's 'pass'
  db.run(`UPDATE users SET password = 'pass', role = 'admin' WHERE username = 'admin'`);

  // Insert another user
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('VerconsDin', 'Vercons2020', 'user')`);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'user.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt: ${username}`);

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }
    if (row) {
      console.log(`Login successful for ${username}, role: ${row.role}`);
      if (row.role === 'admin') {
        res.redirect('/admin?username=' + encodeURIComponent(username));
      } else {
        res.redirect('/user?username=' + encodeURIComponent(username));
      }
    } else {
      console.log(`Invalid login for ${username}`);
      res.send('Invalid username or password');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});