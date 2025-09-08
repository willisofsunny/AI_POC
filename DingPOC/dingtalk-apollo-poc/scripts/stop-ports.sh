#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"

echo "🚫 停止占用端口的进程 (3000/8000)..."

kill_by_port() {
  local PORT="$1"
  if command -v lsof >/dev/null 2>&1; then
    local PIDS
    PIDS=$(lsof -ti :"$PORT" || true)
    if [ -n "$PIDS" ]; then
      echo "🔪 结束端口 $PORT 的进程: $PIDS"
      kill -9 $PIDS || true
    else
      echo "✅ 端口 $PORT 空闲"
    fi
  else
    echo "⚠️ 未找到 lsof，跳过端口 $PORT 的进程清理"
  fi
}

kill_by_pidfile() {
  local PIDFILE="$1"
  if [ -f "$PIDFILE" ]; then
    local PID
    PID=$(cat "$PIDFILE" || true)
    if [ -n "$PID" ] && ps -p "$PID" >/dev/null 2>&1; then
      echo "🔪 结束 PID $PID (来自 $PIDFILE)"
      kill -9 "$PID" || true
    fi
    rm -f "$PIDFILE"
  fi
}

mkdir -p "$LOG_DIR"

# 按端口清理
kill_by_port 8000
kill_by_port 3000

# 按 PID 文件清理（如果存在）
kill_by_pidfile "$LOG_DIR/backend.pid"
kill_by_pidfile "$LOG_DIR/frontend.pid"

echo "🧹 清理完成。"

