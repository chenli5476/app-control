const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有反馈记录
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM feedbacks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取反馈记录失败' });
  }
});

// 添加反馈记录
router.post('/', async (req, res) => {
  try {
    const { user_id, type, content, images } = req.body;
    const [result] = await pool.query(
      'INSERT INTO feedbacks (user_id, type, content, images) VALUES (?, ?, ?, ?)',
      [user_id, type, content, JSON.stringify(images)]
    );
    res.json({ id: result.insertId, message: '反馈提交成功' });
  } catch (error) {
    res.status(500).json({ error: '添加反馈记录失败' });
  }
});

// 更新反馈状态
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const [result] = await pool.query(
      'UPDATE feedbacks SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ message: '状态更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新状态失败' });
  }
});

// 回复反馈
router.put('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const [result] = await pool.query(
      'UPDATE feedbacks SET reply = ?, status = ? WHERE id = ?',
      [reply, '已回复', id]
    );
    res.json({ message: '回复成功' });
  } catch (error) {
    res.status(500).json({ error: '回复失败' });
  }
});

// 获取指定用户的反馈记录
router.get('/by-user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取反馈记录失败' });
  }
});

// 获取指定类型的反馈记录
router.get('/by-type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const [rows] = await pool.query('SELECT * FROM feedbacks WHERE type = ? ORDER BY created_at DESC', [type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取反馈记录失败' });
  }
});

module.exports = router;