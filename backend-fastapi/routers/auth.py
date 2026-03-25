#!/usr/bin/env python3
"""
用户认证 API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import hashlib
import secrets
import json

from database.db_config import get_db
from database.models import User, Notification, UserToken, BannedUser

router = APIRouter(prefix="/api/auth", tags=["认证"])
security = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "level2"
    parent_id: Optional[int] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    phone: Optional[str]
    status: str
    parent_id: Optional[int]
    
    class Config:
        from_attributes = True

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    return secrets.token_urlsafe(32)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    
    # 从数据库查询token
    user_token = db.query(UserToken).filter(UserToken.token == token).first()
    
    if not user_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌"
        )
    
    # 检查token是否过期（如果设置了过期时间）
    if user_token.expires_at and user_token.expires_at < datetime.now():
        db.delete(user_token)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="认证令牌已过期"
        )
    
    # 获取用户信息
    user = db.query(User).filter(User.id == user_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    
    # 检查用户是否被封禁
    if user.status == "banned":
        # 查询封禁原因
        ban_record = db.query(BannedUser).filter(
            BannedUser.user_id == user.id,
            BannedUser.status == "active"
        ).order_by(BannedUser.banned_at.desc()).first()
        
        # 根据是否有封禁原因显示不同的提示
        if ban_record and ban_record.reason:
            message = f"用户违反平台规则，管理员指出具体违反原因为：{ban_record.reason}。如需解封请联系管理员，联系方式为电话1520xxxxx"
        else:
            message = "用户违反平台规则，如需解封请联系管理员，联系方式为电话1520xxxxx"
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message
        )
    
    return {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "name": user.name
    }

@router.post("/login", summary="用户登录")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号不存在"
        )
    
    if user.password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误"
        )
   # 检查用户是否被封禁
    if user.status == "banned":
        # 查询封禁原因
        ban_record = db.query(BannedUser).filter(
            BannedUser.user_id == user.id,
            BannedUser.status == "active"
        ).order_by(BannedUser.banned_at.desc()).first()
        
        # 根据是否有封禁原因显示不同的提示
        if ban_record and ban_record.reason:
            message = f"用户违反平台规则，管理员指出具体违反原因为：{ban_record.reason}。如需解封请联系管理员，联系方式为电话1520xxxxx"
        else:
            message = "用户违反平台规则，如需解封请联系管理员，联系方式为电话1520xxxxx"
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message
        )
    
    # 生成新token
    token = generate_token()
    
    # 删除该用户的旧token，确保每次登录都使用新token
    db.query(UserToken).filter(UserToken.user_id == user.id).delete()
    
    # 保存新token到数据库（永久有效）
    user_token = UserToken(
        user_id=user.id,
        token=token,
        expires_at=None  # 永久有效
    )
    db.add(user_token)
    db.commit()
    
    managed_orchards = [
        {"id": o.orchard_id, "name": o.orchard_name}
        for o in user.managed_orchards
    ]
    
    subordinates = []
    if user.role in ["superadmin", "level1"]:
        subordinates = [
            {"id": s.id, "username": s.username, "name": s.name}
            for s in db.query(User).filter(User.parent_id == user.id).all()
        ]
    
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "name": user.name,
                "role": user.role,
                "phone": user.phone,
                "status": user.status,
                "managed_orchards": managed_orchards,
                "subordinates": subordinates,
                "parent_id": user.parent_id
            }
        }
    }

@router.post("/register", summary="用户注册")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="账号已存在"
        )
    
    if request.role not in ["superadmin", "level1", "level2"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的角色类型"
        )
    
    new_user = User(
        username=request.username,
        name=request.name or request.username,
        password=request.password,
        role=request.role,
        phone=request.phone,
        parent_id=request.parent_id,
        status="active"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "注册成功",
        "data": {
            "id": new_user.id,
            "username": new_user.username,
            "name": new_user.name,
            "role": new_user.role
        }
    }

@router.post("/logout", summary="用户登出")
async def logout(current_user: dict = Depends(verify_token), db: Session = Depends(get_db)):
    # 从数据库删除该用户的所有token
    db.query(UserToken).filter(UserToken.user_id == current_user["user_id"]).delete()
    db.commit()
    
    return {"success": True, "message": "登出成功"}

@router.post("/change-password", summary="修改密码")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if user.password != request.old_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="旧密码错误"
        )
    
    user.password = request.new_password
    user.updated_at = datetime.now()
    db.commit()
    
    # 删除该用户的所有token，需要重新登录
    db.query(UserToken).filter(UserToken.user_id == user.id).delete()
    db.commit()
    
    return {
        "success": True,
        "message": "密码修改成功，请重新登录"
    }

@router.get("/me", summary="获取当前用户信息")
async def get_current_user(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    managed_orchards = [
        {"id": o.orchard_id, "name": o.orchard_name}
        for o in user.managed_orchards
    ]
    
    subordinates = []
    if user.role in ["superadmin", "level1"]:
        subordinates = [
            {"id": s.id, "username": s.username, "name": s.name, "role": s.role}
            for s in db.query(User).filter(User.parent_id == user.id).all()
        ]
    
    return {
        "success": True,
        "data": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "phone": user.phone,
            "status": user.status,
            "managed_orchards": managed_orchards,
            "subordinates": subordinates,
            "parent_id": user.parent_id,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@router.get("/verify", summary="验证Token")
async def verify_token_validity(current_user: dict = Depends(verify_token)):
    return {
        "success": True,
        "data": {
            "user_id": current_user["user_id"],
            "username": current_user["username"],
            "role": current_user["role"]
        }
    }
