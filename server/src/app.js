const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const feeRoutes = require('./routes/fees');
const repairRoutes = require('./routes/repairs');
const complaintRoutes = require('./routes/complaints');
const announcementRoutes = require('./routes/announcements');
const activityRoutes = require('./routes/activities');
const passRoutes = require('./routes/passes');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/passes', passRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '物业管理系统API服务运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API文档请参考各路由配置`);
});

module.exports = app;
