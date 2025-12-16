const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'kanban.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

// Initialize table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    data TEXT,
    updatedAt INTEGER
  )`);
});

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// Default board generator (compatible con `initialSampleData` en frontend)
function defaultBoard() {
  return {
    lists: [
      {
        id: 'list-1',
        title: 'Por hacer',
        cards: [
          {
            id: 'card-1',
            title: 'Investigar idea Kanban',
            description: 'Leer requisitos y diseñar MVP',
            createdAt: Date.now(),
          },
        ],
      },
      {
        id: 'list-2',
        title: 'En progreso',
        cards: [],
      },
      {
        id: 'list-3',
        title: 'Hecho',
        cards: [],
      },
    ],
  };
}

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Get board by id — si no existe, crear uno por defecto y devolverlo
app.get('/api/board/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT data FROM boards WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'db error' });
    if (!row) {
      // Crear un board por defecto y guardarlo
      const dataObj = defaultBoard();
      const raw = JSON.stringify(dataObj);
      const now = Date.now();
      db.run(
        `INSERT INTO boards(id,data,updatedAt) VALUES(?,?,?)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt`,
        [id, raw, now],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ error: 'db error' });
          return res.json({ id, data: dataObj });
        }
      );
      return;
    }
    try {
      const data = JSON.parse(row.data);
      return res.json({ id, data });
    } catch (e) {
      return res.status(500).json({ error: 'invalid json' });
    }
  });
});

// Save board
app.post('/api/board/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const raw = JSON.stringify(data);
    const now = Date.now();
    db.run(
      `INSERT INTO boards(id,data,updatedAt) VALUES(?,?,?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt`,
      [id, raw, now],
      function (err) {
        if (err) return res.status(500).json({ error: 'db error' });
        return res.json({ ok: true, id, updatedAt: now });
      }
    );
  } catch (e) {
    return res.status(400).json({ error: 'invalid payload' });
  }
});

// Simple upload mock
app.post('/api/upload', (req, res) => {
  // Not implementing real uploads here; just return a fake URL
  const fakeUrl = 'https://cdn.example.com/uploads/fake-file.txt';
  res.json({ url: fakeUrl });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
