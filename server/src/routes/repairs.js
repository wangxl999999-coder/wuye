const express = require('express');
const db = require('../database/db');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthenticate, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT r.*, u.name as user_name, u.building, u.room, a.name as assignee_name
    FROM repairs r 
    LEFT JOIN users u ON r.user_id = u.id 
    LEFT JOIN users a ON r.assignee_id = a.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user && req.user.role === 'tenant') {
    query += ' AND r.user_id = ?';
    params.push(req.user.id);
  }

  if (req.user && req.user.role === 'repair') {
    query += ' AND r.assignee_id = ?';
    params.push(req.user.id);
  }

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, repairs) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ repairs });
  });
});

router.get('/:id', optionalAuthenticate, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT r.*, u.name as user_name, u.phone, u.building, u.room, a.name as assignee_name
     FROM repairs r 
     LEFT JOIN users u ON r.user_id = u.id 
     LEFT JOIN users a ON r.assignee_id = a.id
     WHERE r.id = ?`,
    [id],
    (err, repair) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!repair) {
        return res.status(404).json({ message: '报修记录不存在' });
      }
      res.json({ repair });
    }
  );
});

router.post('/', authenticate, (req, res) => {
  const { title, description, type, images } = req.body;
  const user_id = req.user.id;

  db.run(
    'INSERT INTO repairs (user_id, title, description, type, images) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, description, type, images],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '提交失败' });
      }
      res.json({ message: '提交成功', id: this.lastID });
    }
  );
});

router.put('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { status, assignee_id } = req.body;

  if (req.user.role !== 'admin' && req.user.role !== 'repair') {
    return res.status(403).json({ message: '无权限操作' });
  }

  let query = 'UPDATE repairs SET status = ?';
  const params = [status];

  if (assignee_id) {
    query += ', assignee_id = ?';
    params.push(assignee_id);
  }

  if (status === 'completed') {
    query += ', completed_at = CURRENT_TIMESTAMP';
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ message: '更新失败' });
    }
    res.json({ message: '更新成功' });
  });
});

module.exports = router;
