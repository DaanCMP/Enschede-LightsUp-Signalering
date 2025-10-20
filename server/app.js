const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./signs.db');

// Create signs table
db.run(`CREATE TABLE IF NOT EXISTS signs (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT DEFAULT 'offline',
  battery INTEGER,
  signal INTEGER,
  position_lat REAL,
  position_lon REAL,
  heading INTEGER,
  last_seen TIMESTAMP,
  current_mode INTEGER DEFAULT 0
)`);

// Initialize signs if they don't exist
db.get('SELECT COUNT(*) as count FROM signs', (err, row) => {
  if (row.count === 0) {
    console.log('Initializing signs...');
    const signs = [
      { id: '1', name: '1' },
      { id: '2', name: '2' },
      { id: '3', name: '3' }
    ];
    
    signs.forEach(sign => {
      db.run(
        'INSERT INTO signs (id, name, status) VALUES (?, ?, "offline")',
        [sign.id, sign.name]
      );
    });
    console.log('Signs initialized');
  }
});

// Store SSE connections
const sseConnections = new Set();

// Helper function to broadcast to all SSE clients
function broadcastToClients(data) {
  sseConnections.forEach(res => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('SSE broadcast error:', err);
      sseConnections.delete(res);
    }
  });
}

// ===== ESP32 ENDPOINTS =====

// ESP32 status update
app.post('/api/signs/:id/status', (req, res) => {
  const signId = req.params.id;
  const { position, heading, battery, signal } = req.body;
  
  console.log(`ESP32 status update for ${signId}:`, { position, heading, battery, signal });
  
  db.run(
    `UPDATE signs SET 
      status = 'online',
      last_seen = datetime('now'),
      battery = ?,
      signal = ?,
      position_lat = ?,
      position_lon = ?,
      heading = ?
    WHERE id = ?`,
    [battery, signal, position[0], position[1], heading, signId],
    function(err) {
      if (err) {
        console.error('Status update error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      // Broadcast update to web clients
      broadcastToClients({
        type: 'sign_update',
        sign: { id: signId, status: 'online', battery, signal, heading, position }
      });
      
      res.json({ success: true });
    }
  );
});

// ESP32 get command
app.get('/api/signs/:id/command', (req, res) => {
  const signId = req.params.id;
  
  console.log(`ESP32 requesting command for ${signId}`);
  
  db.get('SELECT current_mode FROM signs WHERE id = ?', [signId], (err, row) => {
    if (err) {
      console.error('Command query error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      console.log(`Sign ${signId} not found`);
      return res.status(404).json({ error: 'Sign not found' });
    }
    
    // Update last_seen and status
    db.run(
      'UPDATE signs SET last_seen = datetime("now"), status = "online" WHERE id = ?',
      [signId]
    );
    
    console.log(`Returning command ${row.current_mode} for ${signId}`);
    res.json({ command: row.current_mode });
  });
});

// ===== WEB INTERFACE ENDPOINTS =====

// Get all signs
app.get('/api/signs', (req, res) => {
  db.all('SELECT * FROM signs', (err, signs) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(signs);
  });
});

// Update sign command (from web interface)
app.post('/api/signs/:id/command', (req, res) => {
  const signId = req.params.id;
  const { command } = req.body;
  
  console.log(`🎯 Setting command ${command} for sign ${signId}`);
  
  db.run(
    'UPDATE signs SET current_mode = ? WHERE id = ?',
    [command, signId],
    function(err) {
      if (err) {
        console.error('Command update error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`✅ Command ${command} set for sign ${signId}`);
      
      // Broadcast to web clients
      broadcastToClients({
        type: 'command_update',
        signId: signId,
        command: command
      });
      
      res.json({ success: true });
    }
  );
});

// Update sign name (from web interface)
app.put('/api/signs/:id/name', (req, res) => {
  const signId = req.params.id;
  const { name } = req.body;
  
  console.log(`📝 Renaming sign ${signId} to "${name}"`);
  
  db.run(
    'UPDATE signs SET name = ? WHERE id = ?',
    [name, signId],
    function(err) {
      if (err) {
        console.error('Name update error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`✅ Sign ${signId} renamed to "${name}"`);
      
      // Broadcast to web clients
      broadcastToClients({
        type: 'sign_update',
        sign: { id: signId, name: name }
      });
      
      res.json({ success: true });
    }
  );
});

// SSE endpoint for real-time updates
app.get('/api/signs/events', (req, res) => {
  console.log('SSE connection established');
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  sseConnections.add(res);
  console.log(`SSE connections: ${sseConnections.size}`);

  // Send initial data
  db.all('SELECT * FROM signs', (err, signs) => {
    if (!err && signs) {
      signs.forEach(sign => {
        res.write(`data: ${JSON.stringify({ type: 'sign_update', sign })}\n\n`);
      });
    }
  });

  req.on('close', () => {
    console.log('SSE client disconnected');
    sseConnections.delete(res);
  });
});

// Auto-offline detection (30 seconds)
setInterval(() => {
  db.run(
    `UPDATE signs SET status = 'offline' 
     WHERE last_seen < datetime('now', '-30 seconds')`
  );
}, 30000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for web interface`);
});