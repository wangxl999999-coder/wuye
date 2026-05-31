const express = require('express');
const db = require('../database/db');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthenticate, (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT e.*, u.name as user_name, u.building, u.room FROM events e LEFT JOIN users u ON e.user_id = u.id WHERE 1=1';
  const params = [];

  if (req.user && req.user.role === 'tenant') {
    query += ' AND e.user_id = ?';
    params.push(req.user.id);
  }

  if (status) {
    query += ' AND e.status = ?';
    params.push(status);
  }

  if (type) {
    query += ' AND e.type = ?';
    params.push(type);
  }

  query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ events });
  });
});

router.get('/stats', optionalAuthenticate, (req, res) => {
  const query = `
    SELECT 
      type,
      status,
      COUNT(*) as count
    FROM events
    ${req.user && req.user.role === 'tenant' ? 'WHERE user_id = ' + req.user.id : ''}
    GROUP BY type, status
  `;

  db.all(query, (err, stats) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ stats });
  });
});

router.get('/:id', optionalAuthenticate, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT e.*, u.name as user_name, u.phone, u.building, u.room FROM events e LEFT JOIN users u ON e.user_id = u.id WHERE e.id = ?',
    [id],
    (err, event) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!event) {
        return res.status(404).json({ message: '事件不存在' });
      }
      res.json({ event });
    }
  );
});

router.post('/', authenticate, authorize('admin', 'reception'), (req, res) => {
  const { user_id, type, title, description, priority, due_date, related_id } = req.body;

  db.run(
    'INSERT INTO events (user_id, type, title, description, priority, due_date, related_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id, type, title, description, priority, due_date, related_id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '创建失败' });
      }
      res.json({ message: '创建成功', id: this.lastID });
    }
  );
});

router.put('/:id', authenticate, authorize('admin', 'reception'), (req, res) => {
  const { id } = req.params;
  const { status, title, description, priority, due_date } = req.body;

  db.run(
    'UPDATE events SET status = ?, title = ?, description = ?, priority = ?, due_date = ? WHERE id = ?',
    [status, title, description, priority, due_date, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '更新失败' });
      }
      res.json({ message: '更新成功' });
    }
  );
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: '删除失败' });
    }
    res.json({ message: '删除成功' });
  });
});

module.exports = router;
