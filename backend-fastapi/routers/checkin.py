#!/usr/bin/env python3
"""
打卡记录 API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

from database.db_config import get_db
from database.models import CheckIn, User
from routers.auth import verify_token

router = APIRouter(prefix="/api/checkin", tags=["打卡记录"])

class CheckInCreate(BaseModel):
    orchard_id: Optional[str] = None
    note: Optional[str] = None
    status: Optional[str] = "completed"

class CheckInResponse(BaseModel):
    id: int
    user_id: int
    orchard_id: Optional[str]
    check_in_time: datetime
    note: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", summary="创建打卡记录")
async def create_check_in(
    request: CheckInCreate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    today = date.today()
    existing = db.query(CheckIn).filter(
        CheckIn.user_id == current_user["user_id"],
        CheckIn.check_in_time >= datetime.combine(today, datetime.min.time()),
        CheckIn.check_in_time <= datetime.combine(today, datetime.max.time())
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="今日已打卡"
        )
    
    check_in = CheckIn(
        user_id=current_user["user_id"],
        orchard_id=request.orchard_id,
        note=request.note,
        status=request.status
    )
    
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    
    return {
        "success": True,
        "message": "打卡成功",
        "data": {
            "id": check_in.id,
            "check_in_time": check_in.check_in_time.isoformat(),
            "status": check_in.status
        }
    }

@router.get("/list", summary="获取打卡记录列表")
async def get_check_in_list(
    year: Optional[int] = None,
    month: Optional[int] = None,
    user_id: Optional[int] = None,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    query = db.query(CheckIn)
    
    target_user_id = user_id if user_id else current_user["user_id"]
    
    if current_user["role"] == "level2" and target_user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看他人打卡记录"
        )
    
    if current_user["role"] == "level1":
        subordinate_ids = [s.id for s in db.query(User).filter(User.parent_id == current_user["user_id"]).all()]
        if target_user_id not in subordinate_ids and target_user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权查看该用户打卡记录"
            )
    
    query = query.filter(CheckIn.user_id == target_user_id)
    
    if year and month:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        query = query.filter(
            CheckIn.check_in_time >= start_date,
            CheckIn.check_in_time < end_date
        )
    
    check_ins = query.order_by(CheckIn.check_in_time.desc()).all()
    
    check_in_list = []
    for check_in in check_ins:
        check_in_list.append({
            "id": check_in.id,
            "user_id": check_in.user_id,
            "orchard_id": check_in.orchard_id,
            "check_in_time": check_in.check_in_time.isoformat(),
            "note": check_in.note,
            "status": check_in.status,
            "created_at": check_in.created_at.isoformat()
        })
    
    return {
        "success": True,
        "data": check_in_list,
        "total": len(check_in_list)
    }

@router.get("/today", summary="获取今日打卡状态")
async def get_today_check_in(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    today = date.today()
    check_in = db.query(CheckIn).filter(
        CheckIn.user_id == current_user["user_id"],
        CheckIn.check_in_time >= datetime.combine(today, datetime.min.time()),
        CheckIn.check_in_time <= datetime.combine(today, datetime.max.time())
    ).first()
    
    if check_in:
        return {
            "success": True,
            "data": {
                "checked_in": True,
                "check_in_time": check_in.check_in_time.isoformat(),
                "note": check_in.note,
                "status": check_in.status
            }
        }
    else:
        return {
            "success": True,
            "data": {
                "checked_in": False
            }
        }

@router.get("/stats", summary="获取打卡统计")
async def get_check_in_stats(
    year: Optional[int] = None,
    month: Optional[int] = None,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    query = db.query(CheckIn).filter(CheckIn.user_id == current_user["user_id"])
    
    if year and month:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        query = query.filter(
            CheckIn.check_in_time >= start_date,
            CheckIn.check_in_time < end_date
        )
    
    total = query.count()
    
    today = date.today()
    today_check_in = db.query(CheckIn).filter(
        CheckIn.user_id == current_user["user_id"],
        CheckIn.check_in_time >= datetime.combine(today, datetime.min.time()),
        CheckIn.check_in_time <= datetime.combine(today, datetime.max.time())
    ).first()
    
    return {
        "success": True,
        "data": {
            "total": total,
            "today_checked_in": today_check_in is not None
        }
    }

@router.delete("/{check_in_id}", summary="删除打卡记录")
async def delete_check_in(
    check_in_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    check_in = db.query(CheckIn).filter(
        CheckIn.id == check_in_id,
        CheckIn.user_id == current_user["user_id"]
    ).first()
    
    if not check_in:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="打卡记录不存在"
        )
    
    db.delete(check_in)
    db.commit()
    
    return {"success": True, "message": "打卡记录已删除"}
