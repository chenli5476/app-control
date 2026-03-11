#!/usr/bin/env python3
"""
FastAPI 服务入口
提供 AI 果树诊断接口
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
from io import BytesIO
from PIL import Image
import logging

from services.kimi_service import KimiService
import config

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建 FastAPI 实例
app = FastAPI(
    title="AI 果树医生 API",
    description="基于 Kimi API 的果树病虫害诊断服务",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Kimi 服务
kimi_service = KimiService()

@app.post("/api/v1/diagnose", summary="果树病虫害诊断")
async def diagnose(
    text: str = Form(None, description="用户描述"),
    image: UploadFile = File(None, description="病害图片"),
    crop_type: str = Form("citrus", description="作物类型：citrus/apple/pear")
):
    """
    诊断果树病虫害
    
    - **text**: 用户对症状的描述（可选）
    - **image**: 病害图片（可选）
    - **crop_type**: 作物类型，默认为柑橘
    """
    try:
        # 验证作物类型
        if crop_type not in config.CROP_TYPES:
            raise HTTPException(status_code=400, detail=f"不支持的作物类型，支持的类型: {config.CROP_TYPES}")
        
        # 处理图片
        image_base64 = None
        if image:
            # 读取图片
            contents = await image.read()
            
            # 检查文件大小
            if len(contents) > config.MAX_IMAGE_SIZE:
                raise HTTPException(status_code=400, detail=f"图片大小超过限制，最大 {config.MAX_IMAGE_SIZE // 1024 // 1024}MB")
            
            # 压缩图片
            img = Image.open(BytesIO(contents))
            
            # 压缩到指定尺寸
            max_size = (config.MAX_IMAGE_DIMENSION, config.MAX_IMAGE_DIMENSION)
            img.thumbnail(max_size)
            
            # 转换为 base64
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=85)
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # 调用 Kimi 服务进行诊断
        result = await kimi_service.diagnose(text, image_base64, crop_type)
        
        return {
            "success": True,
            "data": result,
            "usage": {"prompt_tokens": 0, "completion_tokens": 0}  # 后续可以从 API 响应中获取
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"诊断失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"诊断服务暂时不可用: {str(e)}")

@app.get("/", summary="健康检查")
async def health_check():
    """
    健康检查接口
    """
    return {"status": "ok", "message": "AI 果树医生服务运行正常"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
