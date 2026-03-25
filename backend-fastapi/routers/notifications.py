#!/usr/bin/env python3
"""
通知系统 API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database.db_config import get_db
from database.models import Notification, User
from routers.auth import verify_token

router = APIRouter(prefix="/api/notifications", tags=["通知系统"])

class NotificationCreate(BaseModel):
    title: str
    content: Optional[str] = None
    notification_type: Optional[str] = "system"
    user_id: Optional[int] = None

class NotificationResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    notification_type: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/list", summary="获取通知列表")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.user_id == current_user["user_id"])
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    total = query.count()
    notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    notification_list = []
    for notification in notifications:
        notification_list.append({
            "id": notification.id,
            "title": notification.title,
            "content": notification.content,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat()
        })
    
    return {
        "success": True,
        "data": notification_list,
        "total": total,
        "unread_count": db.query(Notification).filter(
            Notification.user_id == current_user["user_id"],
            Notification.is_read == False
        ).count()
    }

@router.post("/", summary="创建通知")
async def create_notification(
    request: NotificationCreate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in ["superadmin", "level1"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    target_user_id = request.user_id if request.user_id else current_user["user_id"]
    
    if current_user["role"] == "level1" and target_user_id != current_user["user_id"]:
        subordinate_ids = [s.id for s in db.query(User).filter(User.parent_id == current_user["user_id"]).all()]
        if target_user_id not in subordinate_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权给该用户发送通知"
            )
    
    notification = Notification(
        user_id=target_user_id,
        title=request.title,
        content=request.content,
        notification_type=request.notification_type
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return {
        "success": True,
        "message": "通知创建成功",
        "data": {
            "id": notification.id,
            "title": notification.title,
            "created_at": notification.created_at.isoformat()
        }
    }

@router.post("/broadcast", summary="广播通知（超级管理员）")
async def broadcast_notification(
    request: NotificationCreate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要超级管理员权限"
        )
    
    users = db.query(User).filter(User.status == "active").all()
    
    notifications = []
    for user in users:
        notification = Notification(
            user_id=user.id,
            title=request.title,
            content=request.content,
            notification_type=request.notification_type or "system"
        )
        notifications.append(notification)
    
    db.add_all(notifications)
    db.commit()
    
    return {
        "success": True,
        "message": f"广播通知已发送给 {len(users)} 个用户"
    }

@router.put("/{notification_id}/read", summary="标记通知为已读")
async def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user["user_id"]
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"success": True, "message": "通知已标记为已读"}

@router.put("/read-all", summary="标记所有通知为已读")
async def mark_all_notifications_read(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user["user_id"],
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"success": True, "message": "所有通知已标记为已读"}

@router.delete("/{notification_id}", summary="删除通知")
async def delete_notification(
    notification_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user["user_id"]
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"success": True, "message": "通知已删除"}

@router.get("/unread-count", summary="获取未读通知数量")
async def get_unread_count(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user["user_id"],
        Notification.is_read == False
    ).count()
    
    return {
        "success": True,
        "data": {
            "unread_count": count
        }
    }
