import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import { body, validationResult } from 'express-validator';

const app = express();
const db = new Database('database.db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

let server;

// Cleanup function
const cleanup = () => {
  console.log('\nGracefully shutting down...');
  
  // Close the HTTP server first
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      // Then close the database connection
      if (db) {
        console.log('Closing database connection...');
        db.close();
      }
      process.exit(0);
    });

    // Force close after 3 seconds if graceful shutdown fails
    setTimeout(() => {
      console.log('Force closing...');
      process.exit(1);
    }, 3000);
  } else {
    if (db) {
      db.close();
    }
    process.exit(0);
  }
};

// Handle cleanup on various signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);

// Create default user if it doesn't exist
const createDefaultUser = async () => {
  const hashedPassword = await bcrypt.hash('$user$', 10);
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('user', hashedPassword);
  } catch (error) {
    // User probably already exists
  }
};
createDefaultUser();

// Logging middleware
const logRequest = (req, res, next) => {
  const logStmt = db.prepare('INSERT INTO logs (message) VALUES (?)');
  logStmt.run(`${req.method} ${req.path}`);
  next();
};

app.use(logRequest);

// Login endpoint
app.post('/api/login', [
  body('username').trim().notEmpty(),
  body('password').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful' });
});

// Signup endpoint
app.post('/api/signup', [
  body('username').trim().notEmpty(),
  body('password').trim().isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

const PORT = process.env.PORT || 3000;
server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
