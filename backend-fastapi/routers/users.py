#!/usr/bin/env python3
"""
用户管理 API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database.db_config import get_db
from database.models import User, UserOrchard, BannedUser, SystemLog
from routers.auth import verify_token

router = APIRouter(prefix="/api/users", tags=["用户管理"])

class UserCreateRequest(BaseModel):
    username: str
    password: str
    name: Optional[str] = None
    role: str = "level2"
    phone: Optional[str] = None
    parent_id: Optional[int] = None
    managed_orchards: Optional[List[dict]] = []

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    managed_orchards: Optional[List[dict]] = None

class BanRequest(BaseModel):
    reason: Optional[str] = None

def check_admin_permission(current_user: dict):
    if current_user["role"] not in ["superadmin", "level1"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    return True

def check_super_admin_permission(current_user: dict):
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要超级管理员权限"
        )
    return True

@router.get("/list", summary="获取用户列表")
async def get_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_admin_permission(current_user)
    
    query = db.query(User)
    
    if current_user["role"] == "level1":
        current_user_obj = db.query(User).filter(User.id == current_user["user_id"]).first()
        subordinate_ids = [s.id for s in db.query(User).filter(User.parent_id == current_user["user_id"]).all()]
        query = query.filter(User.id.in_(subordinate_ids + [current_user["user_id"]]))
    
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    
    users = query.all()
    
    user_list = []
    for user in users:
        managed_orchards = [
            {"id": o.orchard_id, "name": o.orchard_name}
            for o in user.managed_orchards
        ]
        
        user_list.append({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "password": user.password,
            "role": user.role,
            "phone": user.phone,
            "status": user.status,
            "parent_id": user.parent_id,
            "managed_orchards": managed_orchards,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    
    return {"success": True, "data": user_list}

@router.get("/{user_id}", summary="获取用户详情")
async def get_user(
    user_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_admin_permission(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if current_user["role"] == "level1":
        if user.parent_id != current_user["user_id"] and user.id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权查看该用户"
            )
    
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
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "password": user.password,
            "role": user.role,
            "phone": user.phone,
            "status": user.status,
            "parent_id": user.parent_id,
            "managed_orchards": managed_orchards,
            "subordinates": subordinates,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@router.post("/create", summary="创建用户")
async def create_user(
    request: UserCreateRequest,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_admin_permission(current_user)
    
    if current_user["role"] == "level1" and request.role == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权创建超级管理员"
        )
    
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
    
    for orchard in request.managed_orchards:
        user_orchard = UserOrchard(
            user_id=new_user.id,
            orchard_id=orchard.get("id"),
            orchard_name=orchard.get("name")
        )
        db.add(user_orchard)
    
    db.commit()
    
    log = SystemLog(
        level="info",
        message=f"创建用户: {new_user.username}",
        user_id=current_user["user_id"]
    )
    db.add(log)
    db.commit()
    
    return {
        "success": True,
        "message": "用户创建成功",
        "data": {
            "id": new_user.id,
            "username": new_user.username,
            "name": new_user.name,
            "role": new_user.role
        }
    }

@router.put("/{user_id}", summary="更新用户信息")
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_admin_permission(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if current_user["role"] == "level1":
        if user.parent_id != current_user["user_id"] and user.id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权修改该用户"
            )
    
    if request.name is not None:
        user.name = request.name
    if request.phone is not None:
        user.phone = request.phone
    if request.password is not None:
        user.password = request.password
    
    if request.managed_orchards is not None:
        db.query(UserOrchard).filter(UserOrchard.user_id == user_id).delete()
        for orchard in request.managed_orchards:
            user_orchard = UserOrchard(
                user_id=user.id,
                orchard_id=orchard.get("id"),
                orchard_name=orchard.get("name")
            )
            db.add(user_orchard)
    
    user.updated_at = datetime.now()
    db.commit()
    
    return {"success": True, "message": "用户信息更新成功"}

@router.post("/{user_id}/ban", summary="封禁用户")
async def ban_user(
    user_id: int,
    request: BanRequest,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_admin_permission(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if user.role == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无法封禁超级管理员"
        )
    
    if current_user["role"] == "level1" and user.parent_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权封禁该用户"
        )
    
    user.status = "banned"
    
    ban_record = BannedUser(
        user_id=user.id,
        reason=request.reason,
        banned_by=current_user["user_id"]
    )
    db.add(ban_record)
    
    log = SystemLog(
        level="warning",
        message=f"封禁用户: {user.username}, 原因: {request.reason}",
        user_id=current_user["user_id"]
    )
    db.add(log)
    db.commit()
    
    return {"success": True, "message": "用户已封禁"}

@router.post("/{user_id}/unban", summary="解封用户")
async def unban_user(
    user_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_admin_permission(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if current_user["role"] == "level1" and user.parent_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权解封该用户"
        )
    
    user.status = "active"
    
    ban_record = db.query(BannedUser).filter(
        BannedUser.user_id == user.id,
        BannedUser.status == "active"
    ).first()
    
    if ban_record:
        ban_record.status = "inactive"
        ban_record.unbanned_at = datetime.now()
    
    log = SystemLog(
        level="info",
        message=f"解封用户: {user.username}",
        user_id=current_user["user_id"]
    )
    db.add(log)
    db.commit()
    
    return {"success": True, "message": "用户已解封"}

@router.delete("/{user_id}", summary="删除用户")
async def delete_user(
    user_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_super_admin_permission(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if user.role == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无法删除超级管理员"
        )
    
    log = SystemLog(
        level="warning",
        message=f"删除用户: {user.username}",
        user_id=current_user["user_id"]
    )
    db.add(log)
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": "用户已删除"}

@router.get("/subordinates/list", summary="获取下属用户列表")
async def get_subordinates(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in ["superadmin", "level1"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    subordinates = db.query(User).filter(User.parent_id == current_user["user_id"]).all()
    
    subordinate_list = []
    for user in subordinates:
        managed_orchards = [
            {"id": o.orchard_id, "name": o.orchard_name}
            for o in user.managed_orchards
        ]
        
        subordinate_list.append({
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "phone": user.phone,
            "status": user.status,
            "managed_orchards": managed_orchards
        })
    
    return {"success": True, "data": subordinate_list}
