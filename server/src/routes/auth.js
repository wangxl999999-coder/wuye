const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'property_management_secret_key_2024',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone,
        building: user.building,
        room: user.room
      }
    });
  });
});

router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', authenticate, (req, res) => {
  const { name, phone, avatar } = req.body;
  const userId = req.user.id;

  db.run(
    'UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?',
    [name, phone, avatar, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '更新失败' });
      }
      res.json({ message: '更新成功' });
    }
  );
});

module.exports = router;
