import os
from dotenv import load_dotenv
from openai import OpenAI

# 加载环境变量
load_dotenv()

# 获取 API Key
api_key = os.getenv("MOONSHOT_API_KEY")
print(f"API Key: {api_key[:10]}...{api_key[-5:]} if api_key else 'Key not found'")
print(f"API Key length: {len(api_key)} if api_key else 0")

# 创建客户端（注意：无空格！）
client = OpenAI(
    base_url="https://api.moonshot.cn/v1",  # 确保无空格
    api_key=api_key
)

# 测试模型列表
try:
    models = client.models.list()
    print("\nAvailable models:")
    for model in models.data:
        print(f"  - {model.id}")
except Exception as e:
    print(f"\nError: {e}")
