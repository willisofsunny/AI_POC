AI POC 專案導航 / AI POC Project Navigation

概述
- 這是一個純前端的多語系導航頁，彙整當前資料夾中的各個原型頁面。
- 適合部署到 GitHub Pages（不支援 Node 伺服器程式）。

部署到 GitHub Pages（推薦做法）
1) 在 GitHub 建立空白倉庫（Private 或 Public 皆可）。
2) 在本資料夾執行以下指令（若尚未初始化 git）：

   git init
   git branch -M main
   git add .
   git commit -m "chore: init site and GitHub Pages workflow"
   git remote add origin https://github.com/<你的帳號>/<你的倉庫>.git
   git push -u origin main

3) 推送完成後，Actions 會自動觸發「Deploy to GitHub Pages」工作流。
4) 到倉庫 Settings → Pages，確認 Source 為「GitHub Actions」。
5) 幾分鐘後即可於 Pages 網址瀏覽網站（會顯示於 Actions 執行紀錄或 Pages 設定頁）。

注意
- GitHub Pages 僅提供靜態託管：`黑克松紀錄系統/server.js` 等後端程式不會在 Pages 上執行。
- 如需自訂網域，於倉庫根目錄加入 `CNAME` 檔（內容為你的網域）。

多語內容與連結調整
- 修改 `index.html` 檔案的 `projects` 陣列與 `dict` 字典即可新增或調整卡片與文案。

English (Quick Steps)
1. Create a new repo on GitHub.
2. Run in this folder:

   git init && git branch -M main
   git add . && git commit -m "init"
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main

3. Pages deploys automatically via GitHub Actions.

