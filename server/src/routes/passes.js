const express = require('express');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, u.name as user_name, u.building, u.room
    FROM passes p 
    LEFT JOIN users u ON p.user_id = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role === 'tenant') {
    query += ' AND p.user_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, passes) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ passes });
  });
});

router.post('/', authenticate, (req, res) => {
  const { type, holder_name, id_card, valid_from, valid_to } = req.body;
  const user_id = req.user.id;

  db.run(
    'INSERT INTO passes (user_id, type, holder_name, id_card, valid_from, valid_to) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, type, holder_name, id_card, valid_from, valid_to],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '申请失败' });
      }
      res.json({ message: '申请成功', id: this.lastID });
    }
  );
});

router.put('/:id', authenticate, authorize('admin', 'reception'), (req, res) => {
  const { id } = req.params;
  const { signature_status, approval_status } = req.body;

  db.run(
    'UPDATE passes SET signature_status = ?, approval_status = ? WHERE id = ?',
    [signature_status, approval_status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '更新失败' });
      }
      res.json({ message: '更新成功' });
    }
  );
});

module.exports = router;
