const db = require('./db');
const bcrypt = require('bcryptjs');

const initDatabase = () => {
  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS users`);
    db.run(`DROP TABLE IF EXISTS events`);
    db.run(`DROP TABLE IF EXISTS properties`);
    db.run(`DROP TABLE IF EXISTS fees`);
    db.run(`DROP TABLE IF EXISTS repairs`);
    db.run(`DROP TABLE IF EXISTS complaints`);
    db.run(`DROP TABLE IF EXISTS announcements`);
    db.run(`DROP TABLE IF EXISTS activities`);
    db.run(`DROP TABLE IF EXISTS passes`);
    db.run(`DROP TABLE IF EXISTS vehicles`);

    db.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      avatar TEXT,
      building TEXT,
      room TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'normal',
      due_date DATETIME,
      related_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      building TEXT NOT NULL,
      room TEXT NOT NULL,
      area REAL,
      lease_start DATE,
      lease_end DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      property_id INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      month TEXT NOT NULL,
      status TEXT DEFAULT 'unpaid',
      due_date DATE,
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )`);

    db.run(`CREATE TABLE repairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      images TEXT,
      status TEXT DEFAULT 'pending',
      assignee_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      status TEXT DEFAULT 'pending',
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      type TEXT,
      priority TEXT DEFAULT 'normal',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      start_time DATETIME,
      end_time DATETIME,
      max_participants INTEGER,
      status TEXT DEFAULT 'upcoming',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE passes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      holder_name TEXT,
      id_card TEXT,
      signature_status TEXT DEFAULT 'incomplete',
      approval_status TEXT DEFAULT 'pending',
      valid_from DATE,
      valid_to DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      plate_number TEXT NOT NULL,
      owner_name TEXT,
      license_expiry DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    const salt = bcrypt.genSaltSync(10);
    
    const users = [
      { username: 'admin', password: bcrypt.hashSync('123456', salt), name: '系统管理员', role: 'admin', phone: '13800138000' },
      { username: 'tenant1', password: bcrypt.hashSync('123456', salt), name: '张三', role: 'tenant', phone: '13800138001', building: '1栋', room: '101' },
      { username: 'tenant2', password: bcrypt.hashSync('123456', salt), name: '李四', role: 'tenant', phone: '13800138002', building: '2栋', room: '201' },
      { username: 'reception1', password: bcrypt.hashSync('123456', salt), name: '王接待', role: 'reception', phone: '13800138003' },
      { username: 'repair1', password: bcrypt.hashSync('123456', salt), name: '陈维修', role: 'repair', phone: '13800138004' },
      { username: 'visitor1', password: bcrypt.hashSync('123456', salt), name: '访客刘', role: 'visitor', phone: '13800138005' }
    ];

    const stmt = db.prepare('INSERT INTO users (username, password, name, role, phone, building, room) VALUES (?, ?, ?, ?, ?, ?, ?)');
    users.forEach(user => {
      stmt.run(user.username, user.password, user.name, user.role, user.phone, user.building, user.room);
    });
    stmt.finalize();

    console.log('数据库初始化完成！');
    console.log('默认账号: admin / 123456');
  });
};

initDatabase();
