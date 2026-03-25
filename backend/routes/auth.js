// routes/auth.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 从数据库查询用户（支持使用username或phone登录）
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR phone = ?) AND password = ?',
      [username, username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: '用户名或密码错误' 
      });
    }
    
    const user = rows[0];
    
    // 检查用户状态
    if (user.status === 'banned') {
      return res.status(403).json({ 
        success: false, 
        error: '账号已被封禁',
        data: {
          ban_reason: user.ban_reason || '未指定原因'
        }
      });
    }
    
    // 生成模拟 token
    const token = `token-${Date.now()}-${user.id}`;
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          phone: user.phone,
          orchard_id: user.orchard_id
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 登出
router.post('/logout', async (req, res) => {
  try {
    res.json({ success: true, message: '登出成功' });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({ error: '登出失败' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    // 从Authorization头获取token
    const authHeader = req.headers.authorization;
    
    // 如果没有Authorization头，返回401错误
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: '未认证' 
      });
    }
    
    // 提取token
    const token = authHeader.substring(7);
    
    // 解析token获取用户ID（token格式：token-${timestamp}-${userId}）
    const tokenParts = token.split('-');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ 
        success: false, 
        error: '无效的token' 
      });
    }
    
    const userId = tokenParts[2];
    
    // 从数据库查询用户
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: '用户不存在' 
      });
    }
    
    const user = rows[0];
    
    // 检查用户状态
    if (user.status === 'banned') {
      return res.status(403).json({ 
        success: false, 
        error: '账号已被封禁',
        data: {
          ban_reason: user.ban_reason || '未指定原因'
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone,
        orchard_id: user.orchard_id
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取用户信息失败' 
    });
  }
});

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, phone, role } = req.body;
    
    // 检查用户是否已存在
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: '用户名已存在' 
      });
    }
    
    // 插入新用户
    const [result] = await pool.query(
      'INSERT INTO users (id, username, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [username, username, password, role || 'level2', phone]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: username,
          username,
          role: role || 'level2',
          name: name || username,
          phone
        }
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 修改密码
router.post('/change-password', async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.headers['x-user-id'] || 'zhilan';
    
    // 验证旧密码
    const [users] = await pool.query(
      'SELECT * FROM users WHERE (id = ? OR username = ?) AND password = ?',
      [userId, userId, old_password]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '原密码错误' 
      });
    }
    
    // 更新密码
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ? OR username = ?',
      [new_password, userId, userId]
    );
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 验证token
router.get('/verify', async (req, res) => {
  try {
    res.json({ success: true, message: 'Token有效' });
  } catch (error) {
    console.error('验证Token失败:', error);
    res.status(500).json({ error: '验证Token失败' });
  }
});

module.exports = router;