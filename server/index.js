import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

console.log('Loaded OpenRouter key:', process.env.OPENROUTER_API_KEY ? 'YES' : 'NO');

const app = express();
const PORT = process.env.PORT || 5300;
const JWT_SECRET = 'your_jwt_secret'; // Change this to a strong secret in production

app.use(cors());
app.use(express.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // update if your MySQL user is different
  password: '', // update if your MySQL password is set
  database: 'study_sesh' // update to your database name
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL database👍👍👍!');
  }
});

app.get('/', (req, res) => {
  res.send('Study Sesh API is running!');
});

// Example route to test MySQL connection
app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ solution: results[0].solution });
  });
});

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const hash = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, result) => {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.json({ success: true });
  });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Get all subjects
app.get('/subjects', auth, (req, res) => {
  db.query('SELECT * FROM subjects WHERE user_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Add a new subject
app.post('/subjects', auth, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.query('INSERT INTO subjects (name, description, user_id) VALUES (?, ?, ?)', [name, description, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: result.insertId, name, description });
  });
});

// Update a subject
app.put('/subjects/:id', auth, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  db.query('UPDATE subjects SET name = ?, description = ? WHERE id = ? AND user_id = ?', [name, description, id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id, name, description });
  });
});

// Delete a subject
app.delete('/subjects/:id', auth, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM subjects WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Assignments CRUD (user-specific)
app.get('/assignments', auth, (req, res) => {
  db.query('SELECT * FROM assignments WHERE user_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/assignments', auth, (req, res) => {
  const { subject_id, title, description, due_date, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.query('INSERT INTO assignments (subject_id, title, description, due_date, status, user_id) VALUES (?, ?, ?, ?, ?, ?)', [subject_id, title, description, due_date, status || 'pending', req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: result.insertId, subject_id, title, description, due_date, status: status || 'pending' });
  });
});

app.put('/assignments/:id', auth, (req, res) => {
  const { id } = req.params;
  const { subject_id, title, description, due_date, status } = req.body;
  db.query('UPDATE assignments SET subject_id = ?, title = ?, description = ?, due_date = ?, status = ? WHERE id = ? AND user_id = ?', [subject_id, title, description, due_date, status, id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id, subject_id, title, description, due_date, status });
  });
});

app.delete('/assignments/:id', auth, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM assignments WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Notes CRUD (user-specific)
app.get('/notes', auth, (req, res) => {
  db.query('SELECT * FROM notes WHERE user_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/notes', auth, (req, res) => {
  const { subject_id, title, content } = req.body;
  db.query('INSERT INTO notes (subject_id, title, content, user_id) VALUES (?, ?, ?, ?)', [subject_id, title, content, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: result.insertId, subject_id, title, content });
  });
});

app.put('/notes/:id', auth, (req, res) => {
  const { id } = req.params;
  const { subject_id, title, content } = req.body;
  db.query('UPDATE notes SET subject_id = ?, title = ?, content = ? WHERE id = ? AND user_id = ?', [subject_id, title, content, id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id, subject_id, title, content });
  });
});

app.delete('/notes/:id', auth, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Tests CRUD (user-specific)
app.get('/tests', auth, (req, res) => {
  db.query('SELECT * FROM tests WHERE user_id = ?', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

app.post('/tests', auth, (req, res) => {
  const { subject_id, title, test_date, score } = req.body;
  db.query('INSERT INTO tests (subject_id, title, test_date, score, user_id) VALUES (?, ?, ?, ?, ?)', [subject_id, title, test_date, score, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: result.insertId, subject_id, title, test_date, score });
  });
});

app.put('/tests/:id', auth, (req, res) => {
  const { id } = req.params;
  const { subject_id, title, test_date, score } = req.body;
  db.query('UPDATE tests SET subject_id = ?, title = ?, test_date = ?, score = ? WHERE id = ? AND user_id = ?', [subject_id, title, test_date, score, id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id, subject_id, title, test_date, score });
  });
});

app.delete('/tests/:id', auth, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tests WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Password reset endpoint
app.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ error: 'Username and new password required' });
  const hash = await bcrypt.hash(newPassword, 10);
  db.query('UPDATE users SET password = ? WHERE username = ?', [hash, username], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  });
});

// Use OpenRouter for AI assistant
app.post('/ai-assistant', auth, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });
  try {
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // You can change to any available OpenRouter model
        messages,
        max_tokens: 500
      })
    });
    const data = await apiRes.json();
    if (!apiRes.ok) {
      return res.status(500).json({ error: 'AI error', details: data.error?.message || data });
    }
    res.json({ response: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'AI error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
