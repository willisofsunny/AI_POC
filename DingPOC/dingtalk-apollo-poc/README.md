# 钉钉-Apollo 员工数据集成 POC

## 项目简介

这是一个概念验证（POC）项目，用于演示钉钉员工数据与Apollo系统的集成流程。通过调用钉钉的三个核心API（在职员工、待入职员工、离职员工），经过ETL处理后导入Apollo系统。

### 功能特性

- 🔌 **钉钉API集成**: 调用钉钉员工管理API获取数据
- 🔄 **ETL数据处理**: 数据清洗、转换和格式化
- 💾 **本地数据存储**: SQLite数据库存储处理结果
- 🚀 **Apollo系统导入**: 将数据同步到Apollo系统
- 📊 **可视化界面**: React + Ant Design展示数据
- 🎛️ **手动触发同步**: 点击按钮执行数据同步

## 技术架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   DingTalk API  │
│   React + Antd  │◄──►│   Node.js + Express │◄──►│   员工数据接口  │
│   Port: 3000    │    │   Port: 8000     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       
         │              ┌────────▼────────┐              
         │              │   SQLite DB     │              
         │              │   数据存储      │              
         │              └─────────────────┘              
         │                       │                       
         └───────────────────────┼───────────────────────
                                 ▼                       
                    ┌─────────────────────┐              
                    │    Apollo System    │              
                    │    数据导入目标     │              
                    └─────────────────────┘              
```

## 快速开始

### 环境要求

- Node.js 16.x+
- npm 或 yarn
- Git

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd dingtalk-apollo-poc
   ```

2. **自动设置**
   ```bash
   node scripts/setup.js
   ```

3. **配置环境变量**
   编辑 `.env` 文件（可选，建议通过前端界面配置）：
   ```env
   DINGTALK_CORP_ID=your_corp_id_here
   DINGTALK_CLIENT_ID=your_client_id_here
   DINGTALK_CLIENT_SECRET=your_client_secret_here
   ```

4. **启动服务**
   ```bash
   # 同时启动前后端
   npm run dev:all
   
   # 或分别启动
   npm run dev:backend   # 后端服务
   npm run dev:frontend  # 前端服务
   ```

5. **访问应用**
   - 前端界面: http://localhost:3000
   - 后端API: http://localhost:8000/health

## 使用指南

### 数据同步流程

1. 打开前端界面 http://localhost:3000
2. 查看当前员工数据统计
3. 点击"同步员工数据"按钮
4. 系统将依次执行：
   - 调用钉钉API获取三类员工数据
   - ETL数据处理和格式转换
   - 保存到本地SQLite数据库
   - 导入到Apollo系统（模拟）
5. 在表格中查看同步结果

### API接口说明

#### 后端API接口

- `GET /health` - 健康检查
- `POST /api/sync-employees` - 手动触发数据同步
- `GET /api/employees` - 获取员工数据
- `GET /api/sync-logs` - 获取同步日志

### 目录结构

```
dingtalk-apollo-poc/
├── backend/                 # 后端服务
│   ├── services/           # 业务逻辑
│   │   ├── dingtalk.js    # 钉钉API服务
│   │   ├── database.js    # 数据库服务
│   │   └── apollo.js      # Apollo集成服务
│   ├── app.js             # Express应用入口
│   └── package.json       # 后端依赖
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── App.js         # 主应用组件
│   │   └── index.js       # 应用入口
│   └── package.json       # 前端依赖
├── scripts/                # 工具脚本
│   ├── setup.js           # 自动安装脚本
│   └── health-check.js    # 健康检查脚本
├── data/                   # 数据存储目录
├── logs/                   # 日志文件目录
├── .env                    # 环境变量配置
└── README.md              # 项目说明文档
```

## 开发调试

### 健康检查

```bash
npm run health
```

检查项目各组件运行状态：
- 后端服务连接状态
- 前端服务访问状态  
- 钉钉API连通性
- 数据库文件状态

### 常见问题

**Q: 端口被占用怎么办？**
```bash
# 查找占用进程
lsof -i :3000
lsof -i :8000

# 终止进程
kill -9 <PID>
```

**Q: 钉钉API调用失败？**
- 检查 `.env` 文件中的 `DINGTALK_CORP_ID` 和 `DINGTALK_API_TOKEN`
- 确认网络连接正常
- 查看后端控制台日志

**Q: 前端无法连接后端？**
- 确保后端服务已启动在 8000 端口
- 检查 `frontend/package.json` 中的 `proxy` 配置

## 钉钉API配置

### 配置方式
- **推荐**: 通过前端界面动态配置 (支持多套环境)
- **可选**: 通过 `.env` 文件预设默认值

### 支持的API接口
本POC已集成钉钉智能人事的三个核心API：

1. **Access Token获取**
   - 接口: `POST /v1.0/oauth2/{corpId}/token` (api.dingtalk.com)
   - 参数: corpId (路径参数), client_id, client_secret, grant_type="client_credentials"
   - 有效期: 7200秒 (2小时)

2. **在职员工列表**
   - 接口: `POST /topapi/smartwork/hrm/employee/queryonjob` (oapi.dingtalk.com)
   - 权限: 智能人事个人信息读权限
   - 状态筛选: 试用期、正式、待离职、无状态

3. **待入职员工列表**
   - 接口: `POST /topapi/smartwork/hrm/employee/querypreentry` (oapi.dingtalk.com)
   - 权限: 智能人事个人信息读权限
   - 支持分页查询

4. **离职员工列表**
   - 接口: `GET /v1.0/hrm/employees/dismissions` (api.dingtalk.com)
   - 权限: 智能人事个人信息读权限
   - 使用HRM 1.0 API格式

### API限制
- 月调用量: 10,000次
- 并发限制: 20 QPS
- 适合POC演示使用
- 需要开通智能人事应用权限

## Apollo集成说明

当前版本使用模拟模式进行Apollo数据导入演示。

### 生产环境配置

如需连接真实Apollo系统，请配置：

```env
APOLLO_DB_HOST=your-apollo-host
APOLLO_DB_PORT=3306
APOLLO_DB_NAME=apollo_database
APOLLO_DB_USER=apollo_user
APOLLO_DB_PASSWORD=apollo_password
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues: GitHub Issues
- 邮箱: support@example.com

---

**注意**: 这是一个POC演示项目，仅用于技术验证。生产环境使用前请进行充分的安全评估和性能测试。