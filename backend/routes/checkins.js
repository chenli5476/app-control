const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取所有打卡记录
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM check_ins ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取打卡记录失败' });
  }
});

// 添加打卡记录
router.post('/', async (req, res) => {
  try {
    const { user_id, tree_id, type, content, photos, weather, location } = req.body;
    const [result] = await pool.query(
      'INSERT INTO check_ins (user_id, tree_id, type, content, photos, weather, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, tree_id, type, content, JSON.stringify(photos), weather, location]
    );
    res.json({ id: result.insertId, message: '打卡成功' });
  } catch (error) {
    res.status(500).json({ error: '添加打卡记录失败' });
  }
});

// 获取指定用户的打卡记录
router.get('/by-user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM check_ins WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取打卡记录失败' });
  }
});

// 获取指定日期的打卡记录
router.get('/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const [rows] = await pool.query('SELECT * FROM check_ins WHERE DATE(created_at) = ?', [date]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取打卡记录失败' });
  }
});

// 获取打卡统计数据
router.get('/statistics', async (req, res) => {
  try {
    // 获取本月打卡类型分布
    const [typeStats] = await pool.query(
      'SELECT type, COUNT(*) as count FROM check_ins WHERE DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(CURRENT_DATE, "%Y-%m") GROUP BY type'
    );
    
    // 获取本月每日打卡数量
    const [dailyStats] = await pool.query(
      'SELECT DATE(created_at) as date, COUNT(*) as count FROM check_ins WHERE DATE_FORMAT(created_at, "%Y-%m") = DATE_FORMAT(CURRENT_DATE, "%Y-%m") GROUP BY DATE(created_at) ORDER BY date'
    );
    
    res.json({ typeStats, dailyStats });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 获取打卡记录列表（与前端API匹配）
router.get('/list', async (req, res) => {
  try {
    const { year, month, user_id } = req.query;
    let query = 'SELECT * FROM check_ins';
    const params = [];
    
    if (year || month || user_id) {
      query += ' WHERE';
      if (year) {
        query += ' YEAR(created_at) = ?';
        params.push(year);
      }
      if (year && (month || user_id)) {
        query += ' AND';
      }
      if (month) {
        query += ' MONTH(created_at) = ?';
        params.push(month);
      }
      if ((year || month) && user_id) {
        query += ' AND';
      }
      if (user_id) {
        query += ' user_id = ?';
        params.push(user_id);
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
      error: '获取打卡记录失败' 
    });
  }
});

// 获取今日打卡记录
router.get('/today', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM check_ins WHERE DATE(created_at) = DATE(CURRENT_DATE) ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取今日打卡记录失败' 
    });
  }
});

// 获取打卡统计数据（与前端API匹配）
router.get('/stats', async (req, res) => {
  try {
    const { year, month } = req.query;
    let query = 'SELECT type, COUNT(*) as count FROM check_ins';
    const params = [];
    
    if (year || month) {
      query += ' WHERE';
      if (year) {
        query += ' YEAR(created_at) = ?';
        params.push(year);
      }
      if (year && month) {
        query += ' AND';
      }
      if (month) {
        query += ' MONTH(created_at) = ?';
        params.push(month);
      }
    }
    
    query += ' GROUP BY type';
    const [stats] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取打卡统计数据失败' 
    });
  }
});

// 删除打卡记录
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM check_ins WHERE id = ?', [id]);
    res.json({ 
      success: true, 
      message: '打卡记录已删除' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '删除打卡记录失败' 
    });
  }
});

module.exports = router;