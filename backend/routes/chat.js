const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 保存聊天消息
router.post('/history', async (req, res) => {
  try {
    const { role, content, image_url } = req.body;
    const user_id = req.headers['x-user-id'] || 1; // 默认用户ID
    const session_id = `session-${Date.now()}`;
    
    const [result] = await pool.query(
      'INSERT INTO ai_chats (user_id, session_id, question, answer, images) VALUES (?, ?, ?, ?, ?)',
      [user_id, session_id, role === 'user' ? content : '', role === 'assistant' ? content : '', image_url ? JSON.stringify([image_url]) : null]
    );
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        role,
        content,
        image_url,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '保存消息失败' 
    });
  }
});

// 获取聊天历史记录
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const user_id = req.headers['x-user-id'] || 1; // 默认用户ID
    
    const [rows] = await pool.query(
      'SELECT id, user_id, session_id, question, answer, images, created_at FROM ai_chats WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [user_id, parseInt(limit), parseInt(offset)]
    );
    
    // 转换数据格式以匹配前端期望
    const messages = rows.map(row => ({
      id: row.id,
      role: row.question ? 'user' : 'assistant',
      content: row.question || row.answer,
      image_url: row.images ? JSON.parse(row.images)[0] : null,
      created_at: row.created_at
    }));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '获取聊天历史失败' 
    });
  }
});

// 清空聊天历史
router.delete('/history', async (req, res) => {
  try {
    const user_id = req.headers['x-user-id'] || 1; // 默认用户ID
    await pool.query('DELETE FROM ai_chats WHERE user_id = ?', [user_id]);
    res.json({ 
      success: true, 
      message: '聊天历史已清空' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '清空聊天历史失败' 
    });
  }
});

// 删除指定消息
router.delete('/history/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    await pool.query('DELETE FROM ai_chats WHERE id = ?', [messageId]);
    res.json({ 
      success: true, 
      message: '消息已删除' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '删除消息失败' 
    });
  }
});

module.exports = router;