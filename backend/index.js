const express = require('express');
const cors = require('cors');
const { createDatabase, createTables } = require('./db');
const checkinsRouter = require('./routes/checkins');
const aiResponsesRouter = require('./routes/ai-responses');
const feedbacksRouter = require('./routes/feedbacks');
const usersRouter = require('./routes/users');
const orchardsRouter = require('./routes/orchards');
const treesRouter = require('./routes/trees');
const tasksRouter = require('./routes/tasks');
const inventoryRouter = require('./routes/inventory');
const diagnosisRouter = require('./routes/diagnosis');

const app = express();
const port = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/checkins', checkinsRouter);
app.use('/api/ai-responses', aiResponsesRouter);
app.use('/api/feedbacks', feedbacksRouter);
app.use('/api/users', usersRouter);
app.use('/api/orchards', orchardsRouter);
app.use('/api/trees', treesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/diagnosis', diagnosisRouter);

// 根路径响应
app.get('/', (req, res) => {
  res.json({
    message: '果园管理系统后端服务',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      checkins: '/api/checkins',
      ai_responses: '/api/ai-responses',
      feedbacks: '/api/feedbacks',
      users: '/api/users',
      orchards: '/api/orchards',
      trees: '/api/trees',
      tasks: '/api/tasks',
      inventory: '/api/inventory',
      diagnosis: '/api/diagnosis'
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 初始化数据库
async function initDatabase() {
  await createDatabase();
  await createTables();
}

// 启动服务器
app.listen(port, async () => {
  await initDatabase();
  console.log(`服务器运行在 http://localhost:${port}`);
});

module.exports = app;