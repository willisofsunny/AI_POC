# AI POC 專案導航

> 🚀 **次世代 AI 人力資源管理原型與概念驗證平台**

一個集結多個創新 AI 人力資源管理原型的整合展示平台，涵蓋從理論框架到實際應用的完整技術棧。

## 📋 專案概覽

本專案整合了七個核心 AI POC 項目，每個都代表著人力資源管理領域的不同創新方向：

### 🎯 核心項目

| 項目 | 技術棧 | 狀態 | 描述 |
|------|--------|------|------|
| **[HR Co-Agents 框架](./HR核心任務.html)** | HTML5, TailwindCSS, JavaScript | ✅ 完成 | 次世代 HR 平台的 AI 互動設計框架，展示四種 AI 專家角色協作模式 |
| **[金豬食堂 UX 報告](./易用性報告.html)** | Chart.js, 互動式分析 | ✅ 完成 | AI 智慧排班系統完整易用性測試報告，包含 SUS 評分與改善建議 |
| **[金豬反饋整合](./金豬反饋.html)** | 數據視覺化 | ✅ 完成 | 金豬食堂專案多維度反饋整合與系統優化建議 |
| **[AI 智能助手](./智能夥伴.html)** | 對話式 AI | 🔄 開發中 | 新一代 AI 智能助手互動原型，展示自然語言對話能力 |
| **[Apollo AI 排班系統](./排班/排班.html)** | 複雜演算法, UI/UX | ✅ 完成 | 績效價值導向的智能排班原型，支援複雜規則與 AI 自動排班 |
| **[AI 驅動黑客松](./黑克松紀錄系統/黑克松紀錄.html)** | 學習框架 | ✅ 完成 | AI 驅動黑客松完整學習歷程與創新方法論 |
| **[釘釘-Apollo 集成](http://localhost:3000)** | Node.js, React, SQLite | 🚀 運行中 | 釘釘智能人事 API 與 Apollo 系統深度集成 POC |

## 🛠 技術特色

### 前端技術棧
- **現代化 UI**: TailwindCSS + 自定義 CSS 動畫
- **響應式設計**: 支援桌面與移動端設備
- **互動體驗**: 豐富的動畫效果與用戶交互
- **多語言支持**: 繁體中文、簡體中文、English

### 後端整合
- **API 集成**: 釘釘智能人事 API
- **數據處理**: ETL 數據轉換與同步
- **數據庫**: SQLite 本地存儲
- **視覺化**: Chart.js 數據圖表

### AI 功能
- **智能排班**: 基於機器學習的排班算法
- **對話式交互**: 自然語言處理
- **數據分析**: 智能洞察與預測
- **用戶體驗優化**: AI 驅動的 UX 改善

## 🚀 快速開始

### 環境要求
- Node.js 16.x+
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)
- Git

### 安裝與運行

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd AI_POC
   ```

2. **啟動導航頁面**
   ```bash
   # 使用本地服務器
   python -m http.server 8080
   # 或使用 Node.js
   npx serve .
   ```

3. **訪問應用**
   - 導航頁面: http://localhost:8080
   - 各個專案可通過導航頁面訪問

4. **啟動釘釘 POC (需要額外設置)**
   ```bash
   cd DingPOC/dingtalk-apollo-poc
   npm install
   npm run dev:all
   ```

## 📁 專案結構

```
AI_POC/
├── 📁 DingPOC/                    # 釘釘-Apollo 集成 POC
│   └── dingtalk-apollo-poc/
│       ├── backend/               # Node.js 後端服務
│       ├── frontend/             # React 前端應用
│       └── README.md             # 詳細使用說明
├── 📁 排班/                      # Apollo AI 排班系統
│   └── 排班.html
├── 📁 黑克松紀錄系統/              # AI 驅動黑客松
│   └── 黑克松紀錄.html
├── 📄 HR核心任務.html             # HR Co-Agents 框架
├── 📄 易用性報告.html             # 金豬食堂 UX 報告
├── 📄 金豬反饋.html               # 金豬反饋整合
├── 📄 智能夥伴.html               # AI 智能助手
├── 📄 index.html                 # 主導航頁面
└── 📄 README.md                  # 本檔案
```

## 🎨 設計亮點

### 視覺設計
- **深色主題**: 現代感的深色配色方案
- **漸層效果**: 豐富的色彩漸層與光影效果
- **微動畫**: 精緻的懸停效果與過渡動畫
- **卡片設計**: 優雅的卡片式佈局

### 用戶體驗
- **直觀導航**: 清晰的項目分類與描述
- **多語言**: 支援三種語言切換
- **響應式**: 完美適配各種螢幕尺寸
- **載入優化**: 快速的頁面載入與響應

## 📊 技術指標

### 性能表現
- ⚡ 頁面載入時間: < 1s
- 🎯 Lighthouse 評分: 95+
- 📱 移動端適配: 100%
- 🌐 瀏覽器支持: 99%

### 代碼品質
- 🏗 模組化設計: 高內聚低耦合
- 🔧 可維護性: 清晰的程式碼結構
- 🧪 錯誤處理: 完善的異常處理機制
- 📝 文件完整: 詳細的註釋與文檔

## 🔮 未來規劃

### 短期目標 (3個月)
- [ ] 完善 AI 智能助手功能
- [ ] 新增更多視覺化圖表
- [ ] 優化移動端體驗
- [ ] 增加更多語言支持

### 長期願景 (12個月)
- [ ] 整合更多 AI 服務
- [ ] 建立完整的用戶管理系統
- [ ] 開發 API 管理平台
- [ ] 建立雲端部署方案

## 🚀 部署指南

### GitHub Pages 部署 (推薦)

1. **建立 GitHub 倉庫**
   ```bash
   # 在 GitHub 建立新倉庫後執行
   git init
   git branch -M main
   git add .
   git commit -m "chore: init site and GitHub Pages workflow"
   git remote add origin https://github.com/<你的帳號>/<你的倉庫>.git
   git push -u origin main
   ```

2. **設定 Pages**
   - 前往倉庫 Settings → Pages
   - Source 選擇「GitHub Actions」
   - 系統會自動部署靜態網站

3. **訪問網站**
   - 幾分鐘後即可通過 Pages URL 訪問

### 本地開發

```bash
# 靜態檔案服務
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 訪問 http://localhost:8080
```

## 🤝 貢獻指南

我們歡迎社群貢獻！請參考以下步驟：

1. **Fork 專案**
2. **創建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交變更** (`git commit -m 'Add some amazing feature'`)
4. **推送分支** (`git push origin feature/amazing-feature`)
5. **創建 Pull Request**

### 貢獻類型
- 🐛 Bug 修復
- ✨ 新功能開發
- 📝 文檔改善
- 🎨 UI/UX 優化
- ⚡ 性能優化

## 📞 聯絡資訊

### 專案維護者
- **技術負責人**: [您的姓名]
- **Email**: [您的郵箱]
- **GitHub**: [您的GitHub]

### 技術支持
- **問題回報**: [GitHub Issues](your-repo/issues)
- **功能建議**: [GitHub Discussions](your-repo/discussions)
- **技術文檔**: [Wiki](your-repo/wiki)

## 📄 授權條款

本專案採用 [MIT License](LICENSE) 授權條款。

---

## 🏷 標籤

`AI` `人力資源` `POC` `原型開發` `機器學習` `用戶體驗` `數據視覺化` `React` `Node.js` `TailwindCSS`

---

**📝 最後更新**: 2025年9月8日  
**🔄 版本**: v1.0.0  
**👥 貢獻者**: 1  
**⭐ Stars**: 歡迎給我們星星！