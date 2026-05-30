const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, username, name, phone, role, building, room, created_at FROM users';
  const params = [];

  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }
    res.json({ users });
  });
});

router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ message: '无权限访问' });
  }

  db.get(
    'SELECT id, username, name, phone, role, building, room, avatar, created_at FROM users WHERE id = ?',
    [id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      res.json({ user });
    }
  );
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { username, password, name, phone, role, building, room } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  db.run(
    'INSERT INTO users (username, password, name, phone, role, building, room) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, name, phone, role, building, room],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '创建失败，用户名可能已存在' });
      }
      res.json({ message: '创建成功', id: this.lastID });
    }
  );
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const { id } = req.params;
  const { name, phone, role, building, room, password } = req.body;

  let query = 'UPDATE users SET name = ?, phone = ?, role = ?, building = ?, room = ?';
  const params = [name, phone, role, building, room];

  if (password) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    query += ', password = ?';
    params.push(hashedPassword);
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

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: '删除失败' });
    }
    res.json({ message: '删除成功' });
  });
});

module.exports = router;
