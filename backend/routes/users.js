const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取用户列表（支持角色和状态筛选）
router.get('/list', async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT * FROM users';
    const params = [];
    
    if (role || status) {
      query += ' WHERE';
      if (role) {
        query += ' role = ?';
        params.push(role);
      }
      if (role && status) {
        query += ' AND';
      }
      if (status) {
        query += ' status = ?';
        params.push(status);
      }
    }
    
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取用户列表失败' 
    });
  }
});

// 添加用户
router.post('/', async (req, res) => {
  try {
    const { username, password, phone, role, orchard_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (username, password, phone, role, orchard_id) VALUES (?, ?, ?, ?, ?)',
      [username, password || '123456', phone, role, orchard_id]
    );
    res.json({ id: result.insertId, message: '用户添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加用户失败' });
  }
});

// 创建用户（与前端API匹配）
router.post('/create', async (req, res) => {
  try {
    const { username, password, phone, name, role, orchard_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (username, password, phone, name, role, orchard_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password || '123456', phone, name || username, role || 'level2', orchard_id]
    );
    res.json({
      success: true,
      data: {
        id: result.insertId,
        username,
        name: name || username,
        role: role || 'level2',
        phone,
        orchard_id
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '创建用户失败' 
    });
  }
});

// 获取下属用户列表
router.get('/subordinates/list', async (req, res) => {
  try {
    // 这里可以根据实际需求实现下属用户的查询逻辑
    // 暂时返回所有非超级管理员用户
    const [rows] = await pool.query('SELECT * FROM users WHERE role != ? ORDER BY created_at DESC', ['superadmin']);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取下属用户列表失败' 
    });
  }
});

// 获取指定用户
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: '用户不存在' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, phone, role, orchard_id } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET username = ?, password = ?, phone = ?, role = ?, orchard_id = ? WHERE id = ?',
      [username, password, phone, role, orchard_id, id]
    );
    res.json({ message: '用户信息更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 封禁用户
router.post('/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await pool.query('UPDATE users SET status = ?, ban_reason = ? WHERE id = ?', ['banned', reason, id]);
    res.json({ 
      success: true, 
      message: '用户已封禁' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '封禁用户失败' 
    });
  }
});

// 解封用户
router.post('/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET status = ? WHERE id = ?', ['active', id]);
    res.json({ 
      success: true, 
      message: '用户已解封' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '解封用户失败' 
    });
  }
});

// 获取指定果园的用户
router.get('/by-orchard/:orchard_id', async (req, res) => {
  try {
    const { orchard_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE orchard_id = ? ORDER BY created_at DESC', [orchard_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

module.exports = router;