const express = require('express');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT c.*, u.name as user_name, u.building, u.room
    FROM complaints c 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role === 'tenant') {
    query += ' AND c.user_id = ?';
    params.push(req.user.id);
  }

  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, complaints) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ complaints });
  });
});

router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT c.*, u.name as user_name, u.phone, u.building, u.room
     FROM complaints c 
     LEFT JOIN users u ON c.user_id = u.id 
     WHERE c.id = ?`,
    [id],
    (err, complaint) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!complaint) {
        return res.status(404).json({ message: '投诉记录不存在' });
      }
      res.json({ complaint });
    }
  );
});

router.post('/', authenticate, (req, res) => {
  const { title, description, type } = req.body;
  const user_id = req.user.id;

  db.run(
    'INSERT INTO complaints (user_id, title, description, type) VALUES (?, ?, ?, ?)',
    [user_id, title, description, type],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '提交失败' });
      }
      res.json({ message: '提交成功', id: this.lastID });
    }
  );
});

router.put('/:id/reply', authenticate, authorize('admin', 'reception'), (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  db.run(
    'UPDATE complaints SET reply = ?, status = ? WHERE id = ?',
    [reply, 'replied', id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '回复失败' });
      }
      res.json({ message: '回复成功' });
    }
  );
});

module.exports = router;
