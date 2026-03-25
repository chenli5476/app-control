#!/usr/bin/env python3
"""
数据库模型定义
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database.db_config import Base
import enum

class UserRole(enum.Enum):
    SUPER_ADMIN = "superadmin"
    LEVEL_1 = "level1"
    LEVEL_2 = "level2"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="level2")
    phone = Column(String(20), nullable=True)
    status = Column(String(20), default="active")
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    managed_orchards = relationship("UserOrchard", back_populates="user", cascade="all, delete-orphan")
    subordinates = relationship("User", backref="parent", remote_side=[id])
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    check_ins = relationship("CheckIn", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class UserOrchard(Base):
    __tablename__ = "user_orchards"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    orchard_id = Column(String(50), nullable=False)
    orchard_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="managed_orchards")

class ChatHistory(Base):
    __tablename__ = "chat_histories"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="chat_histories")

class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    orchard_id = Column(String(50), nullable=True)
    check_in_time = Column(DateTime, default=datetime.now)
    note = Column(Text, nullable=True)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="check_ins")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    notification_type = Column(String(50), default="system")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="notifications")

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    level = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    user_id = Column(Integer, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

class BannedUser(Base):
    __tablename__ = "banned_users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=True)
    banned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    banned_at = Column(DateTime, default=datetime.now)
    unbanned_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="active")

class UserToken(Base):
    __tablename__ = "user_tokens"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
