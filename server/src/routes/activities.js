const express = require('express');
const db = require('../database/db');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuthenticate, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT a.*, u.name as creator_name
    FROM activities a 
    LEFT JOIN users u ON a.created_by = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }

  query += ' ORDER BY a.start_time DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, activities) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ activities });
  });
});

router.get('/:id', optionalAuthenticate, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT a.*, u.name as creator_name
     FROM activities a 
     LEFT JOIN users u ON a.created_by = u.id 
     WHERE a.id = ?`,
    [id],
    (err, activity) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!activity) {
        return res.status(404).json({ message: '活动不存在' });
      }
      res.json({ activity });
    }
  );
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { title, description, location, start_time, end_time, max_participants } = req.body;
  const created_by = req.user.id;

  db.run(
    'INSERT INTO activities (title, description, location, start_time, end_time, max_participants, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, location, start_time, end_time, max_participants, created_by],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '创建失败' });
      }
      res.json({ message: '创建成功', id: this.lastID });
    }
  );
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const { id } = req.params;
  const { title, description, location, start_time, end_time, max_participants, status } = req.body;

  db.run(
    'UPDATE activities SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?, max_participants = ?, status = ? WHERE id = ?',
    [title, description, location, start_time, end_time, max_participants, status, id],
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

  db.run('DELETE FROM activities WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: '删除失败' });
    }
    res.json({ message: '删除成功' });
  });
});

module.exports = router;
