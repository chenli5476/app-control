const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

// 添加任务
router.post('/', async (req, res) => {
  try {
    const { title, type, assignee_id, orchard_id, due_date, status, priority } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tasks (title, type, assignee_id, orchard_id, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, type, assignee_id, orchard_id, due_date, status, priority]
    );
    res.json({ id: result.insertId, message: '任务添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加任务失败' });
  }
});

// 获取指定任务
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: '任务不存在' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: '获取任务信息失败' });
  }
});

// 更新任务信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, assignee_id, orchard_id, due_date, status, priority } = req.body;
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, type = ?, assignee_id = ?, orchard_id = ?, due_date = ?, status = ?, priority = ? WHERE id = ?',
      [title, type, assignee_id, orchard_id, due_date, status, priority, id]
    );
    res.json({ message: '任务信息更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新任务信息失败' });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: '任务删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除任务失败' });
  }
});

// 获取指定用户的任务
router.get('/by-assignee/:assignee_id', async (req, res) => {
  try {
    const { assignee_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE assignee_id = ? ORDER BY due_date ASC', [assignee_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

// 获取指定果园的任务
router.get('/by-orchard/:orchard_id', async (req, res) => {
  try {
    const { orchard_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE orchard_id = ? ORDER BY due_date ASC', [orchard_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

// 获取待办任务
router.get('/status/pending', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE status = ? ORDER BY due_date ASC', ['待办']);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取待办任务失败' });
  }
});

module.exports = router;