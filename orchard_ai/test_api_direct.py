import os
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 获取 API Key
api_key = os.getenv("MOONSHOT_API_KEY")
print(f"API Key: {api_key[:10]}...{api_key[-5:]}")
print(f"API Key length: {len(api_key)}")

# 测试 API 端点
url = "https://api.moonshot.cn/v1/models"
headers = {
    "Authorization": f"Bearer {api_key}"
}

try:
    response = requests.get(url, headers=headers)
    print(f"\nStatus code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"\nError: {e}")
