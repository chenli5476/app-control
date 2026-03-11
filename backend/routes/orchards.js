const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有果园
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orchards ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取果园列表失败' });
  }
});

// 添加果园
router.post('/', async (req, res) => {
  try {
    const { name, location, area, owner_id, map_data } = req.body;
    const [result] = await pool.query(
      'INSERT INTO orchards (name, location, area, owner_id, map_data) VALUES (?, ?, ?, ?, ?)',
      [name, location, area, owner_id, JSON.stringify(map_data)]
    );
    res.json({ id: result.insertId, message: '果园添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加果园失败' });
  }
});

// 获取指定果园
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orchards WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: '果园不存在' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: '获取果园信息失败' });
  }
});

// 更新果园信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, area, owner_id, map_data } = req.body;
    const [result] = await pool.query(
      'UPDATE orchards SET name = ?, location = ?, area = ?, owner_id = ?, map_data = ? WHERE id = ?',
      [name, location, area, owner_id, JSON.stringify(map_data), id]
    );
    res.json({ message: '果园信息更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新果园信息失败' });
  }
});

// 删除果园
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM orchards WHERE id = ?', [id]);
    res.json({ message: '果园删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除果园失败' });
  }
});

// 获取指定用户的果园
router.get('/by-owner/:owner_id', async (req, res) => {
  try {
    const { owner_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orchards WHERE owner_id = ? ORDER BY created_at DESC', [owner_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取果园列表失败' });
  }
});

module.exports = router;