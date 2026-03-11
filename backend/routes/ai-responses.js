const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有AI对话记录
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ai_chats ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取对话记录失败' });
  }
});

// 添加AI对话记录
router.post('/', async (req, res) => {
  try {
    const { user_id, session_id, question, answer, images, category, rating } = req.body;
    const [result] = await pool.query(
      'INSERT INTO ai_chats (user_id, session_id, question, answer, images, category, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, session_id, question, answer, JSON.stringify(images), category, rating]
    );
    res.json({ id: result.insertId, message: '对话记录添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加对话记录失败' });
  }
});

// 获取指定用户的AI对话记录
router.get('/by-user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM ai_chats WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取对话记录失败' });
  }
});

// 获取指定会话的AI对话记录
router.get('/by-session/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM ai_chats WHERE session_id = ? ORDER BY created_at ASC', [session_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取对话记录失败' });
  }
});

// 评分AI回答
router.put('/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const [result] = await pool.query(
      'UPDATE ai_chats SET rating = ? WHERE id = ?',
      [rating, id]
    );
    res.json({ message: '评分成功' });
  } catch (error) {
    res.status(500).json({ error: '评分失败' });
  }
});

module.exports = router;