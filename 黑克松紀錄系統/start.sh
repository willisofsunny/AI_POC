#!/bin/bash

# 設置終端編碼
export LANG=zh_TW.UTF-8

echo ""
echo "========================================"
echo "    黑克松紀錄系統 - 啟動器"
echo "========================================"
echo ""

# 檢查 Node.js 安裝
echo "正在檢查 Node.js 安裝..."
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo ""
    echo "請先安裝 Node.js："
    echo "1. 前往 https://nodejs.org/"
    echo "2. 下載並安裝 LTS 版本"
    echo "3. 重新運行此腳本"
    echo ""
    read -p "按 Enter 鍵退出..."
    exit 1
fi

echo "✅ Node.js 已安裝 ($(node --version))"
echo ""

# 檢查依賴套件
echo "正在檢查依賴套件..."
if [ ! -d "node_modules" ]; then
    echo "📦 首次運行，正在安裝依賴套件..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗"
        read -p "按 Enter 鍵退出..."
        exit 1
    fi
    echo "✅ 依賴安裝完成"
else
    echo "✅ 依賴套件已存在"
fi

echo ""
echo "🚀 正在啟動服務器..."
echo ""
echo "服務器啟動後，請在瀏覽器中訪問："
echo "http://localhost:3000"
echo ""
echo "按 Ctrl+C 可停止服務器"
echo ""

# 啟動服務器
npm start

echo ""
echo "服務器已停止"
read -p "按 Enter 鍵退出..."
