# 果树智慧管理系统

## 项目简介

果树智慧管理系统是一个基于现代Web技术开发的果园管理平台，集成了AI智能诊断、日常管理、数据分析等功能，旨在帮助果农和果园管理者更高效地管理果园。

## 技术栈

### 前端
- **框架**：React 18
- **构建工具**：Vite
- **路由**：React Router
- **UI组件库**：Ant Design
- **状态管理**：React useState（本地状态）
- **样式**：CSS + Ant Design 内置样式

### 后端
- **语言**：Python 3.14+
- **框架**：FastAPI
- **AI服务**：Kimi API（kimi-k2.5模型）
- **开发服务器**：Uvicorn

### 其他
- **版本控制**：Git
- **包管理器**：npm（前端）、pip（后端）

## 快速开始

### 1. 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 http://localhost:5173

### 2. 后端启动

```bash
# 进入后端目录
cd backend-fastapi

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
python main.py
```

后端服务将运行在 http://localhost:8000

## 系统架构

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   前端应用       │ ──→ │   FastAPI后端    │ ──→ │   Kimi API      │
│   (React)       │      │   (Python)      │      │   (AI模型)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 功能模块

### 核心功能
1. **AI果树医生**：基于Kimi API的智能诊断系统，支持文本和图片输入
2. **日常管理**：果园日常打卡、任务调度、树木档案管理
3. **数据分析**：果园数据统计与分析
4. **权限管理**：三级权限系统，满足不同角色需求
5. **团队管理**：多用户协同工作

### 页面结构
- **登录页**：统一登录入口
- **超级管理员后台**：用户管理、系统监控
- **一级权限后台**：果园管理、下属管理
- **二级权限后台**：果园日常管理

## 权限系统

### 权限层级
1. **超级管理员**（superadmin）
   - 账号：121380
   - 密码：121380
   - 权限：查看所有账号，系统监控，封禁用户

2. **一级权限**（level1，大老板）
   - 示例账号：level1_001
   - 密码：123456
   - 权限：管理自己的果园和下属管理者

3. **二级权限**（level2，果园管理者）
   - 示例账号：level2_001
   - 密码：123456
   - 权限：管理分配的果园

## 环境变量配置

### 前端
在 `frontend/` 目录下创建 `.env` 文件：

```env
# 可选：是否启用百度AI Mock模式
VITE_BAIDU_MOCK=false
```

### 前端后端API配置
在 `frontend/src/config/ai.config.js` 文件中配置后端API地址：

```javascript
// 后端API配置
api: {
  baseUrl: 'http://localhost:8000', // 后端服务基础URL
  timeout: 5000 // 请求超时时间（毫秒）
}
```

当后端服务的端口发生变化时，只需要修改 `baseUrl` 配置，例如：

```javascript
// 后端服务在8001端口
api: {
  baseUrl: 'http://localhost:8001',
  timeout: 5000
}

// 或者后端服务在8021端口
api: {
  baseUrl: 'http://localhost:8021',
  timeout: 5000
}
```

### 后端
在 `backend-fastapi/` 目录下创建 `.env` 文件（参考 `.env.example`）：

```env
# Kimi API 配置
MOONSHOT_API_KEY=your_api_key_here
MODEL=kimi-k2.5

# 服务器配置
HOST=0.0.0.0
PORT=8000
```

## 开发与部署

### 开发模式
- 前端：`cd frontend && npm run dev`
- 后端：`cd backend-fastapi && python main.py`

### 构建部署

```bash
# 进入前端目录并构建
cd frontend
npm run build

# 构建产物在 frontend/dist/ 目录
```

## 测试账号

| 角色 | 账号 | 密码 | 权限范围 |
|------|------|------|----------|
| 超级管理员 | 121380 | 121380 | 所有功能 |
| 一级权限 | level1_001 | 123456 | 管理自己的果园和下属 |
| 二级权限 | level2_001 | 123456 | 管理分配的果园 |

## 常见问题

### 1. 登录失败
- 检查账号密码是否正确
- 确认后端服务是否运行
- 尝试清空浏览器 localStorage 后重新登录

### 2. AI诊断失败
- 检查后端服务是否运行
- 确认 API Key 是否正确配置
- 检查网络连接

### 3. 权限不足
- 确认登录账号的角色
- 检查是否访问了权限范围外的页面

## 项目结构

```
├── frontend/              # 前端应用（React + Vite）
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── config/        # 配置
│   │   ├── contexts/      # 上下文
│   │   ├── services/      # 服务
│   │   ├── styles/        # 样式
│   │   ├── utils/         # 工具
│   │   ├── App.jsx        # 应用入口
│   │   └── main.jsx       # 渲染入口
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend-fastapi/       # FastAPI 后端
│   ├── data/              # 数据文件
│   ├── services/          # 服务模块
│   ├── main.py            # 主入口
│   ├── config.py          # 配置
│   └── requirements.txt   # 依赖
│
├── backend/               # 备用 Node.js 后端（Express）
│   ├── routes/
│   └── index.js
│
├── .gitignore             # Git 忽略配置
└── README.md              # 项目说明
```

## API 接口说明

### AI诊断接口
- **URL**: `http://localhost:8000/api/v1/diagnose`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **参数**:
  - `text`: 用户描述（可选）
  - `image`: 图片文件（可选）
  - `crop_type`: 作物类型，默认 citrus（可选）

### 健康检查接口
- **URL**: `http://localhost:8000/`
- **Method**: GET

## 联系我们

如有问题或建议，请联系项目团队。

---

*果树智慧管理系统 - 让果园管理更智能*
