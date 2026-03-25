const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createDatabase() {
  try {
    // 先连接到MySQL服务器
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('数据库创建成功');
    
    // 关闭连接
    await connection.end();
  } catch (error) {
    console.error('创建数据库失败:', error);
  }
}

async function createTables() {
  try {
    const connection = await pool.getConnection();
    
    // 创建用户表
    await connection.query(`DROP TABLE IF EXISTS users`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL,
        orchard_id INT DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'active',
        ban_reason TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 添加默认用户数据
    await connection.query(`
      INSERT IGNORE INTO users (username, password, phone, name, role) VALUES
      ('15205036033', '121380', '15205036033', '知澜', 'superadmin'),
      ('15367896477', '123456', '15367896477', '张老板', 'level1'),
      ('15205036034', '123456', '15205036034', '李老板', 'level2')
    `);
    
    // 创建果园表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orchards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        area DECIMAL(10,2) NOT NULL,
        owner_id INT NOT NULL,
        map_data JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建地块/果树表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS trees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orchard_id INT NOT NULL,
        block_name VARCHAR(100) NOT NULL,
        tree_no VARCHAR(50) NOT NULL,
        variety VARCHAR(100) NOT NULL,
        plant_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT '正常',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建打卡记录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tree_id INT DEFAULT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        photos JSON DEFAULT NULL,
        weather VARCHAR(255) NOT NULL,
        location VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建AI对话表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        images JSON DEFAULT NULL,
        category VARCHAR(50) DEFAULT NULL,
        rating INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建任务表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        assignee_id INT NOT NULL,
        orchard_id INT NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT '待办',
        priority VARCHAR(20) DEFAULT '中',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建农资库存表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        expiry_date DATE DEFAULT NULL,
        orchard_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建反馈表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        images JSON DEFAULT NULL,
        status VARCHAR(20) DEFAULT '已提交',
        reply TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建通知表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT DEFAULT NULL,
        type VARCHAR(50) DEFAULT 'system',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('数据表创建成功');
    connection.release();
  } catch (error) {
    console.error('创建数据表失败:', error);
  }
}

module.exports = {
  pool,
  createDatabase,
  createTables
};