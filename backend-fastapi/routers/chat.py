#!/usr/bin/env python3
"""
聊天历史 API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from database.db_config import get_db
from database.models import ChatHistory
from routers.auth import verify_token

router = APIRouter(prefix="/api/chat", tags=["聊天历史"])

class ChatMessageCreate(BaseModel):
    role: str
    content: str
    image_url: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    image_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/history", summary="保存聊天消息")
async def save_chat_message(
    request: ChatMessageCreate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    if request.role not in ["user", "assistant", "system"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的消息角色"
        )
    
    chat_message = ChatHistory(
        user_id=current_user["user_id"],
        role=request.role,
        content=request.content,
        image_url=request.image_url
    )
    
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    
    return {
        "success": True,
        "message": "消息保存成功",
        "data": {
            "id": chat_message.id,
            "role": chat_message.role,
            "content": chat_message.content,
            "created_at": chat_message.created_at.isoformat()
        }
    }

@router.get("/history", summary="获取聊天历史")
async def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user["user_id"]
    ).order_by(ChatHistory.created_at.desc()).offset(offset).limit(limit).all()
    
    message_list = []
    for msg in reversed(messages):
        message_list.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "image_url": msg.image_url,
            "created_at": msg.created_at.isoformat()
        })
    
    return {
        "success": True,
        "data": message_list,
        "total": db.query(ChatHistory).filter(ChatHistory.user_id == current_user["user_id"]).count()
    }

@router.delete("/history", summary="清空聊天历史")
async def clear_chat_history(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user["user_id"]).delete()
    db.commit()
    
    return {"success": True, "message": "聊天历史已清空"}

@router.delete("/history/{message_id}", summary="删除单条聊天消息")
async def delete_chat_message(
    message_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    message = db.query(ChatHistory).filter(
        ChatHistory.id == message_id,
        ChatHistory.user_id == current_user["user_id"]
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="消息不存在"
        )
    
    db.delete(message)
    db.commit()
    
    return {"success": True, "message": "消息已删除"}
