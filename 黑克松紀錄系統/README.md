# 黑克松紀錄系統

一個基於 Node.js + Express 的本地 JSON 資料管理系統，用於管理團隊的 Prompt 知識庫。

## 🚀 功能特色

- ✅ **完整的 CRUD 操作**：新增、讀取、更新、刪除 Prompt 記錄
- ✅ **即時資料保存**：資料直接保存到本地 JSON 文件
- ✅ **備份與恢復**：支援資料備份和從備份恢復
- ✅ **匯入匯出**：支援 JSON 格式的資料匯入匯出
- ✅ **離線備用**：當後端不可用時，自動使用 localStorage 備用
- ✅ **響應式設計**：支援各種螢幕尺寸
- ✅ **即時通知**：操作成功/失敗的即時回饋

## 📋 系統需求

- **Node.js** 14.0.0 或更高版本
- **npm** 6.0.0 或更高版本
- **瀏覽器** 支援 ES6+ 的現代瀏覽器

## 🛠️ 安裝步驟

### 1. 安裝 Node.js

前往 [Node.js 官網](https://nodejs.org/) 下載並安裝 LTS 版本。

### 2. 下載專案

將所有文件下載到同一個資料夾中。

### 3. 安裝依賴

在專案資料夾中執行：

```bash
npm install
```

## 🚀 啟動方式

### 方式一：使用啟動腳本（推薦）

#### Windows 用戶
雙擊 `start.bat` 文件

#### Mac/Linux 用戶
```bash
chmod +x start.sh
./start.sh
```

### 方式二：手動啟動

```bash
# 安裝依賴（首次運行）
npm install

# 啟動服務器
npm start

# 或使用開發模式（自動重啟）
npm run dev
```

## 🌐 使用方式

### 1. 啟動服務器

啟動成功後，會看到以下訊息：
```
🚀 黑克松紀錄系統服務器已啟動
📍 服務地址: http://localhost:3000
📁 資料文件: 黑克松資料.json
⏰ 啟動時間: 2025-01-20T...
💡 按 Ctrl+C 停止服務器
```

### 2. 開啟瀏覽器

在瀏覽器中訪問：`http://localhost:3000`

### 3. 使用功能

- **新增 Prompt**：填寫表單並點擊「新增」按鈕
- **編輯 Prompt**：點擊記錄右上角的編輯按鈕（✏️）
- **刪除 Prompt**：點擊記錄右上角的刪除按鈕（×）
- **匯出資料**：點擊「匯出資料」按鈕下載 JSON 文件
- **匯入資料**：點擊「匯入資料」按鈕選擇 JSON 文件
- **創建備份**：點擊「創建備份」按鈕創建資料備份

## 📁 專案結構

```
專案資料夾/
├── 黑克松紀錄.html          # 前端主頁面
├── 黑克松資料.json          # 資料存儲文件
├── server.js               # Express 後端服務器
├── package.json            # Node.js 專案配置
├── start.bat              # Windows 啟動腳本
├── start.sh               # Mac/Linux 啟動腳本
├── README.md              # 使用說明文件
└── 其他 HTML 文件...
```

## 🔧 API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/health` | 健康檢查 |
| GET | `/api/data` | 讀取資料 |
| POST | `/api/save` | 保存資料 |
| POST | `/api/backup` | 創建備份 |
| POST | `/api/restore` | 恢復備份 |

## 📊 資料格式

```json
{
  "prompts": [
    {
      "id": "唯一識別碼",
      "scenario": "使用情境",
      "contributor": "貢獻者",
      "prompt": "提示語內容",
      "notes": "備註/訣竅",
      "createdAt": "創建時間",
      "updatedAt": "更新時間（可選）"
    }
  ],
  "lastUpdated": "最後更新時間"
}
```

## 🚨 故障排除

### 問題 1：端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方案：**
- 關閉其他使用 3000 端口的程序
- 或修改 `server.js` 中的端口號

### 問題 2：無法連接到後端
```
無法連接到後端服務器，請確保服務器已啟動
```

**解決方案：**
- 確認服務器是否已啟動
- 檢查防火牆設置
- 確認端口號是否正確

### 問題 3：依賴安裝失敗
```
npm ERR! code ENOENT
```

**解決方案：**
- 確認 Node.js 版本是否正確
- 清除 npm 快取：`npm cache clean --force`
- 刪除 `node_modules` 資料夾重新安裝

## 🔒 安全注意事項

- 此系統設計用於本地開發和團隊內部使用
- 不建議直接暴露到公網
- 如需公網部署，請添加適當的認證和授權機制

## 📝 開發說明

### 修改端口號
在 `server.js` 中修改：
```javascript
const PORT = process.env.PORT || 3000; // 改為您想要的端口
```

### 添加新的 API 端點
在 `server.js` 中添加新的路由：
```javascript
app.get('/api/new-endpoint', (req, res) => {
    // 您的邏輯
    res.json({ message: '新端點' });
});
```

### 修改前端 API 地址
在 `黑克松紀錄.html` 中修改：
```javascript
this.apiBase = 'http://localhost:3000/api'; // 改為您的後端地址
```

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改進這個系統！

## 📄 授權

MIT License - 詳見 LICENSE 文件

## 📞 支援

如有問題，請：
1. 檢查此 README 文件
2. 查看瀏覽器控制台的錯誤訊息
3. 檢查服務器終端的日誌輸出
4. 提交 Issue 描述問題

---

**享受使用黑克松紀錄系統！** 🎉
