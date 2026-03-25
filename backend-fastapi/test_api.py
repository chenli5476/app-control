#!/usr/bin/env python3
"""
API 测试脚本
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image

# API 地址
API_URL = "http://localhost:8000/api/v1/diagnose"

# 测试文字诊断
def test_text_diagnosis():
    """
    测试文字诊断
    """
    print("=== 测试文字诊断 ===")
    
    data = {
        "text": "我的柑橘树叶片出现黄绿相间的斑驳，果实着色不均匀，请问是什么问题？",
        "crop_type": "citrus"
    }
    
    response = requests.post(API_URL, data=data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

# 测试图片诊断
def test_image_diagnosis():
    """
    测试图片诊断
    """
    print("=== 测试图片诊断 ===")
    
    # 创建一个测试图片（黄色叶片模拟）
    img = Image.new('RGB', (200, 200), color='#FFFF00')
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    img_data = buffer.getvalue()
    
    files = {
        'image': ('test.jpg', img_data, 'image/jpeg')
    }
    
    data = {
        "text": "柑橘叶片黄化",
        "crop_type": "citrus"
    }
    
    response = requests.post(API_URL, data=data, files=files)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

# 测试错误处理
def test_error_handling():
    """
    测试错误处理
    """
    print("=== 测试错误处理 ===")
    
    # 测试空输入
    data = {
        "crop_type": "citrus"
    }
    
    response = requests.post(API_URL, data=data)
    print(f"空输入 - 状态码: {response.status_code}")
    print(f"空输入 - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # 测试不支持的作物类型
    data = {
        "text": "叶片发黄",
        "crop_type": "banana"
    }
    
    response = requests.post(API_URL, data=data)
    print(f"不支持的作物类型 - 状态码: {response.status_code}")
    print(f"不支持的作物类型 - 响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

# 测试健康检查
def test_health_check():
    """
    测试健康检查
    """
    print("=== 测试健康检查 ===")
    
    response = requests.get("http://localhost:8000/")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()

if __name__ == "__main__":
    test_health_check()
    test_text_diagnosis()
    test_image_diagnosis()
    test_error_handling()
    print("测试完成！")
