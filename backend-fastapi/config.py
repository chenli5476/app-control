#!/usr/bin/env python3
"""
配置管理
"""

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# API 配置
MOONSHOT_API_KEY = os.getenv("MOONSHOT_API_KEY")
if not MOONSHOT_API_KEY:
    raise ValueError("MOONSHOT_API_KEY 环境变量未设置")

# 服务配置
HOST = "0.0.0.0"
PORT = 8000

# 图片配置
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2MB
MAX_IMAGE_DIMENSION = 1024  # 最大边长

# 作物类型
CROP_TYPES = ["citrus", "apple", "pear"]
