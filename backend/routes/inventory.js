const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有农资
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取农资列表失败' });
  }
});

// 添加农资
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, unit, expiry_date, orchard_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO inventory (name, category, quantity, unit, expiry_date, orchard_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, quantity, unit, expiry_date, orchard_id]
    );
    res.json({ id: result.insertId, message: '农资添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加农资失败' });
  }
});

// 获取指定农资
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: '农资不存在' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: '获取农资信息失败' });
  }
});

// 更新农资信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, expiry_date, orchard_id } = req.body;
    const [result] = await pool.query(
      'UPDATE inventory SET name = ?, category = ?, quantity = ?, unit = ?, expiry_date = ?, orchard_id = ? WHERE id = ?',
      [name, category, quantity, unit, expiry_date, orchard_id, id]
    );
    res.json({ message: '农资信息更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新农资信息失败' });
  }
});

// 删除农资
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: '农资删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除农资失败' });
  }
});

// 获取指定果园的农资
router.get('/by-orchard/:orchard_id', async (req, res) => {
  try {
    const { orchard_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM inventory WHERE orchard_id = ? ORDER BY category, name', [orchard_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取农资列表失败' });
  }
});

// 获取指定分类的农资
router.get('/by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [rows] = await pool.query('SELECT * FROM inventory WHERE category = ? ORDER BY name', [category]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取农资列表失败' });
  }
});

// 获取低库存农资
router.get('/status/low', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE quantity < 10 ORDER BY quantity ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取低库存农资失败' });
  }
});

// 获取临期农资
router.get('/status/expiring', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE expiry_date IS NOT NULL AND expiry_date < DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) ORDER BY expiry_date ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取临期农资失败' });
  }
});

module.exports = router;