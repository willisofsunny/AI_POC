@echo off
chcp 65001 >nul
title 黑克松紀錄系統啟動器

echo.
echo ========================================
echo    黑克松紀錄系統 - 啟動器
echo ========================================
echo.

echo 正在檢查 Node.js 安裝...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未安裝 Node.js
    echo.
    echo 請先安裝 Node.js：
    echo 1. 前往 https://nodejs.org/
    echo 2. 下載並安裝 LTS 版本
    echo 3. 重新運行此腳本
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安裝
echo.

echo 正在檢查依賴套件...
if not exist "node_modules" (
    echo 📦 首次運行，正在安裝依賴套件...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
    echo ✅ 依賴安裝完成
) else (
    echo ✅ 依賴套件已存在
)

echo.
echo 🚀 正在啟動服務器...
echo.
echo 服務器啟動後，請在瀏覽器中訪問：
echo http://localhost:3000
echo.
echo 按 Ctrl+C 可停止服務器
echo.

npm start

echo.
echo 服務器已停止
pause
