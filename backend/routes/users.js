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

// 添加用户
router.post('/', async (req, res) => {
  try {
    const { username, phone, role, orchard_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (username, phone, role, orchard_id) VALUES (?, ?, ?, ?)',
      [username, phone, role, orchard_id]
    );
    res.json({ id: result.insertId, message: '用户添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加用户失败' });
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
    const { username, phone, role, orchard_id } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET username = ?, phone = ?, role = ?, orchard_id = ? WHERE id = ?',
      [username, phone, role, orchard_id, id]
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