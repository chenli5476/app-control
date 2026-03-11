const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有果树
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trees ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取果树列表失败' });
  }
});

// 添加果树
router.post('/', async (req, res) => {
  try {
    const { orchard_id, block_name, tree_no, variety, plant_date, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO trees (orchard_id, block_name, tree_no, variety, plant_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [orchard_id, block_name, tree_no, variety, plant_date, status]
    );
    res.json({ id: result.insertId, message: '果树添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加果树失败' });
  }
});

// 获取指定果树
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM trees WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: '果树不存在' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: '获取果树信息失败' });
  }
});

// 更新果树信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { orchard_id, block_name, tree_no, variety, plant_date, status } = req.body;
    const [result] = await pool.query(
      'UPDATE trees SET orchard_id = ?, block_name = ?, tree_no = ?, variety = ?, plant_date = ?, status = ? WHERE id = ?',
      [orchard_id, block_name, tree_no, variety, plant_date, status, id]
    );
    res.json({ message: '果树信息更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新果树信息失败' });
  }
});

// 删除果树
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM trees WHERE id = ?', [id]);
    res.json({ message: '果树删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除果树失败' });
  }
});

// 获取指定果园的果树
router.get('/by-orchard/:orchard_id', async (req, res) => {
  try {
    const { orchard_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM trees WHERE orchard_id = ? ORDER BY block_name, tree_no', [orchard_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取果树列表失败' });
  }
});

// 获取指定地块的果树
router.get('/by-block/:orchard_id/:block_name', async (req, res) => {
  try {
    const { orchard_id, block_name } = req.params;
    const [rows] = await pool.query('SELECT * FROM trees WHERE orchard_id = ? AND block_name = ? ORDER BY tree_no', [orchard_id, block_name]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取果树列表失败' });
  }
});

module.exports = router;