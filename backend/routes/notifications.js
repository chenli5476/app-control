const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取通知列表
router.get('/list', async (req, res) => {
  try {
    const { unread_only = false, limit = 20, offset = 0 } = req.query;
    const user_id = req.headers['x-user-id'] || 1; // 默认用户ID
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [user_id];
    
    if (unread_only === 'true') {
      query += ' AND is_read = ?';
      params.push(false);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取通知列表失败' 
    });
  }
});

// 创建通知
router.post('/', async (req, res) => {
  try {
    const { title, content, notification_type = 'system', user_id } = req.body;
    const targetUserId = user_id || req.headers['x-user-id'] || 1; // 默认用户ID
    
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, content, type, is_read) VALUES (?, ?, ?, ?, ?)',
      [targetUserId, title, content, notification_type, false]
    );
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        title,
        content,
        type: notification_type,
        user_id: targetUserId,
        is_read: false,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '创建通知失败' 
    });
  }
});

// 广播通知
router.post('/broadcast', async (req, res) => {
  try {
    const { title, content, notification_type = 'system' } = req.body;
    
    // 获取所有用户
    const [users] = await pool.query('SELECT id FROM users');
    
    // 为每个用户创建通知
    for (const user of users) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, content, type, is_read) VALUES (?, ?, ?, ?, ?)',
        [user.id, title, content, notification_type, false]
      );
    }
    
    res.json({ 
      success: true, 
      message: '通知已广播' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '广播通知失败' 
    });
  }
});

// 标记通知为已读
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = ? WHERE id = ?', [true, id]);
    res.json({ 
      success: true, 
      message: '通知已标记为已读' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '标记通知已读失败' 
    });
  }
});

// 标记所有通知为已读
router.put('/read-all', async (req, res) => {
  try {
    const user_id = req.headers['x-user-id'] || 1; // 默认用户ID
    await pool.query('UPDATE notifications SET is_read = ? WHERE user_id = ?', [true, user_id]);
    res.json({ 
      success: true, 
      message: '所有通知已标记为已读' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '标记所有通知已读失败' 
    });
  }
});

// 删除通知
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ 
      success: true, 
      message: '通知已删除' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '删除通知失败' 
    });
  }
});

// 获取未读通知数量
router.get('/unread-count', async (req, res) => {
  try {
    const user_id = req.headers['x-user-id'] || 1; // 默认用户ID
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = ?', [user_id, false]);
    res.json({
      success: true,
      data: {
        unread_count: rows[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取未读通知数量失败' 
    });
  }
});

module.exports = router;