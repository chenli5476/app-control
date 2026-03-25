#!/usr/bin/env python3
"""
数据库初始化脚本
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_config import engine, Base, SessionLocal
from database.models import User, UserOrchard
from datetime import datetime
import pymysql

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "orchard_system")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "121380")

def create_database():
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.close()
    conn.close()
    print(f"数据库 '{DB_NAME}' 创建成功或已存在")

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("数据表创建成功")

def init_default_data():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            super_admin = User(
                username="121380",
                name="知澜",
                password="121380",
                role="superadmin",
                phone="13800138000",
                status="active"
            )
            db.add(super_admin)
            
            level1_user = User(
                username="level1_001",
                name="张老板",
                password="123456",
                role="level1",
                phone="13900139000",
                status="active"
            )
            db.add(level1_user)
            db.commit()
            db.refresh(level1_user)
            
            level2_user1 = User(
                username="level2_001",
                name="李管理",
                password="123456",
                role="level2",
                phone="13700137000",
                parent_id=level1_user.id,
                status="active"
            )
            db.add(level2_user1)
            
            level2_user2 = User(
                username="level2_002",
                name="王管理",
                password="123456",
                role="level2",
                phone="13600136000",
                parent_id=level1_user.id,
                status="active"
            )
            db.add(level2_user2)
            db.commit()
            
            orchards_data = [
                (level1_user.id, "xingfu", "幸福果园"),
                (level1_user.id, "lvse", "绿色果园"),
                (level2_user1.id, "xingfu", "幸福果园"),
                (level2_user2.id, "lvse", "绿色果园"),
            ]
            for user_id, orchard_id, orchard_name in orchards_data:
                orchard = UserOrchard(user_id=user_id, orchard_id=orchard_id, orchard_name=orchard_name)
                db.add(orchard)
            
            db.commit()
            print("默认用户数据初始化成功")
        else:
            print("数据库已有数据，跳过初始化")
    except Exception as e:
        print(f"初始化数据失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("开始初始化数据库...")
    create_database()
    create_tables()
    init_default_data()
    print("数据库初始化完成！")
