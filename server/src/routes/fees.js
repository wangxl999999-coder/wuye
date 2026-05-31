const express = require('express');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { status, month, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT f.*, u.name as user_name, u.building, u.room 
    FROM fees f 
    LEFT JOIN users u ON f.user_id = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (req.user && req.user.role === 'tenant') {
    query += ' AND f.user_id = ?';
    params.push(req.user.id);
  }

  if (status) {
    query += ' AND f.status = ?';
    params.push(status);
  }

  if (month) {
    query += ' AND f.month = ?';
    params.push(month);
  }

  query += ' ORDER BY f.month DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, fees) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ fees });
  });
});

router.get('/my-fees', authenticate, (req, res) => {
  db.all(
    `SELECT * FROM fees WHERE user_id = ? ORDER BY month DESC`,
    [req.user.id],
    (err, fees) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      res.json({ fees });
    }
  );
});

router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT f.*, u.name as user_name, u.phone, u.building, u.room 
     FROM fees f 
     LEFT JOIN users u ON f.user_id = u.id 
     WHERE f.id = ?`,
    [id],
    (err, fee) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!fee) {
        return res.status(404).json({ message: '记录不存在' });
      }
      res.json({ fee });
    }
  );
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { user_id, property_id, amount, type, month, due_date } = req.body;

  db.run(
    'INSERT INTO fees (user_id, property_id, amount, type, month, due_date) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, property_id, amount, type, month, due_date],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '创建失败' });
      }
      res.json({ message: '创建成功', id: this.lastID });
    }
  );
});

router.put('/:id/pay', authenticate, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE fees SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['paid', id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '缴费失败' });
      }
      res.json({ message: '缴费成功' });
    }
  );
});

module.exports = router;
