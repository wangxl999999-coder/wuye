const jwt = require('jsonwebtoken');
const db = require('../database/db');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'property_management_secret_key_2024');
    db.get('SELECT id, username, name, role, phone, building, room FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: '无效的认证令牌' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '无权限访问此资源' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
