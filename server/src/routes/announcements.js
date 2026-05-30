const express = require('express');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const { type, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT a.*, u.name as creator_name
    FROM announcements a 
    LEFT JOIN users u ON a.created_by = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (type) {
    query += ' AND a.type = ?';
    params.push(type);
  }

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, announcements) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ announcements });
  });
});

router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT a.*, u.name as creator_name
     FROM announcements a 
     LEFT JOIN users u ON a.created_by = u.id 
     WHERE a.id = ?`,
    [id],
    (err, announcement) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!announcement) {
        return res.status(404).json({ message: '公告不存在' });
      }
      res.json({ announcement });
    }
  );
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { title, content, type, priority } = req.body;
  const created_by = req.user.id;

  db.run(
    'INSERT INTO announcements (title, content, type, priority, created_by) VALUES (?, ?, ?, ?, ?)',
    [title, content, type, priority, created_by],
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
  const { title, content, type, priority } = req.body;

  db.run(
    'UPDATE announcements SET title = ?, content = ?, type = ?, priority = ? WHERE id = ?',
    [title, content, type, priority, id],
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

  db.run('DELETE FROM announcements WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: '删除失败' });
    }
    res.json({ message: '删除成功' });
  });
});

module.exports = router;
