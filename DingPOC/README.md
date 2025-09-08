# 釘釘-Apollo 員工數據集成 POC

> 🔌 **次世代 AI 人力資源數據集成平台 - 概念驗證**

這是一個概念驗證（POC）項目，展示釘釘智能人事 API 與 Apollo 人力資源系統的深度集成方案。

## 📋 專案概覽

### 🎯 項目目標
- 展示釘釘 API 與 Apollo 系統的集成可行性
- 建立標準化的 ETL 數據處理流程
- 提供可視化的數據同步監控界面
- 為未來正式版本提供技術參考

### ✨ 核心功能
- **🔌 釘釘 API 集成**: 調用釘釘智能人事 API 獲取員工數據
- **🔄 ETL 數據處理**: 數據清洗、轉換和格式化
- **💾 本地數據存儲**: SQLite 數據庫存儲處理結果
- **🚀 Apollo 系統導入**: 將數據同步到 Apollo 系統
- **📊 可視化界面**: React + Ant Design 展示數據
- **🎛️ 手動觸發同步**: 一鍵式數據同步

## 🛠 技術架構

### 前端技術棧
- **React 18** - 現代化用戶界面框架
- **Ant Design** - 企業級 UI 組件庫  
- **Chart.js** - 豐富的數據可視化
- **Axios** - HTTP 客戶端庫

### 後端技術棧
- **Node.js** - JavaScript 運行環境
- **Express.js** - 輕量級 Web 框架
- **SQLite** - 嵌入式數據庫
- **Winston** - 專業日誌管理

### API 集成
- **釘釘 OAuth 2.0** - 安全的身份驗證
- **智能人事 API** - 員工數據獲取
- **Apollo API** - 數據導入接口

## 📁 專案結構

```
DingPOC/
├── 📄 index.html              # 靜態展示頁面（推薦）
├── 📄 README.md               # 項目文檔
├── 📁 API文檔/                # 釘釘 API 調用文檔
│   ├── 獲取應用的 Access Token.md
│   ├── 獲取在職員工列表.md
│   ├── 獲取待入職員工列表.md
│   ├── 獲取離職員工列表.md
│   └── 獲取員工花名冊字段信息.md
├── 📁 frontend/               # React 前端應用
│   ├── src/
│   ├── public/
│   └── package.json
├── 📁 backend/                # Node.js 後端服務
│   ├── services/
│   ├── app.js
│   └── package.json
├── 📁 data/                   # SQLite 數據庫
├── 📁 logs/                   # 系統日誌
└── 📁 scripts/                # 工具腳本
```

## 🚀 快速體驗

### 方案一：靜態展示（推薦）

直接訪問靜態 HTML 頁面，無需安裝任何依賴：

```bash
# 在瀏覽器中打開
open DingPOC/index.html
```

### 方案二：完整動態版本

如需體驗完整的動態功能，需要配置開發環境：

#### 環境要求
- Node.js 16.x+
- npm 或 yarn
- 釘釘開放平台應用憑證

#### 安裝步驟

1. **安裝依賴**
   ```bash
   cd DingPOC
   npm install
   ```

2. **配置環境變量**
   ```bash
   cp .env.example .env
   # 編輯 .env 文件，填入你的釘釘 API 憑證
   ```

3. **啟動服務**
   ```bash
   # 同時啟動前後端
   npm run dev:all
   
   # 或分別啟動
   npm run dev:backend   # 後端: http://localhost:8000
   npm run dev:frontend  # 前端: http://localhost:3000
   ```

## 📊 API 支援清單

| API 名稱 | 功能描述 | 狀態 |
|---------|----------|------|
| Access Token | 獲取 API 調用憑證 | ✅ 已實現 |
| 在職員工列表 | 獲取當前在職員工信息 | ✅ 已實現 |
| 待入職員工 | 獲取即將入職員工信息 | ✅ 已實現 |
| 離職員工列表 | 獲取已離職員工信息 | ✅ 已實現 |
| 花名冊字段 | 獲取員工詳細字段信息 | ✅ 已實現 |

## 🔧 配置說明

### 釘釘 API 配置

在 `.env` 文件中配置以下參數：

```env
# 釘釘企業配置
DINGTALK_CORP_ID=your_corp_id_here
DINGTALK_CLIENT_ID=your_client_id_here
DINGTALK_CLIENT_SECRET=your_client_secret_here

# 服務端口配置（可選）
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Apollo 系統配置（可選）
APOLLO_API_ENDPOINT=your_apollo_endpoint
APOLLO_API_KEY=your_apollo_key
```

### 獲取釘釘憑證

1. 訪問 [釘釘開放平台](https://open.dingtalk.com/)
2. 創建企業內部應用
3. 獲取 AppKey 和 AppSecret
4. 配置應用權限（智能人事相關）

## 📈 數據流程

1. **身份驗證**: 使用 Client Credentials 獲取 Access Token
2. **數據獲取**: 並行調用多個釘釘 API 獲取員工數據
3. **數據清洗**: 標準化數據格式，處理異常值
4. **數據轉換**: 將釘釘數據格式轉換為 Apollo 格式
5. **數據存儲**: 保存到本地 SQLite 數據庫
6. **數據同步**: 批量導入到 Apollo 系統
7. **狀態監控**: 實時監控同步狀態和錯誤日誌

## 🎯 應用場景

### 適用情況
- 需要定期同步釘釘員工數據到其他系統
- 希望建立統一的員工數據管理平台
- 需要員工數據的 ETL 處理和清洗
- 希望可視化監控數據同步狀態

### 不適用情況
- 實時性要求極高的場景（建議使用事件推送）
- 大規模企業（建議使用企業級消息隊列）
- 需要雙向同步的復雜場景

## ⚠️ 注意事項

- **數據安全**: 請妥善保管 API 憑證，避免洩露
- **頻率限制**: 遵守釘釘 API 的調用頻率限制
- **測試環境**: 建議先在測試環境驗證集成效果
- **數據備份**: 重要數據請做好備份措施
- **監控告警**: 建議配置監控告警機制

## 🤝 貢獻指南

1. Fork 本項目
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📞 技術支持

- **問題回報**: [GitHub Issues](../../issues)
- **技術文檔**: [API 文檔](./API文檔/)
- **最佳實踐**: [Wiki](../../wiki)

## 📄 授權條款

本項目採用 MIT License 授權條款。

---

**📝 最後更新**: 2025年9月8日  
**🔄 版本**: v1.0.0  
**👥 狀態**: POC 完成

> 💡 **提示**: 推薦使用靜態 HTML 版本 (`index.html`) 進行展示，完整功能請參考動態版本。