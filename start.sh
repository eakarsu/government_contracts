#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"
if [[ -f .env ]]; then
  set -a
  source ./.env
  set +a
fi

api_port="${BACKEND_PORT:-${PORT:-}}"
ui_port="${FRONTEND_PORT:-${CLIENT_PORT:-}}"
[[ "$api_port" =~ ^[0-9]+$ ]] || { echo "BACKEND_PORT or PORT must be set" >&2; exit 2; }
[[ "$ui_port" =~ ^[0-9]+$ ]] || { echo "FRONTEND_PORT or CLIENT_PORT must be set" >&2; exit 2; }
: "${DATABASE_URL:?DATABASE_URL is required for durable runtime authentication}"
for port in "$api_port" "$ui_port"; do
  if lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use; no process was stopped" >&2
    exit 1
  fi
done

node react_api/scripts/provision-runtime-admin.js
PORT="$api_port" BACKEND_PORT="$api_port" node react_api/server.js &
api_pid=$!
API_PORT="$api_port" UI_PORT="$ui_port" node react_api/scripts/static-ui.js &
ui_pid=$!
cleanup() {
  kill "$api_pid" "$ui_pid" 2>/dev/null || true
  wait "$api_pid" "$ui_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
echo "Government Contracts UI starting at http://127.0.0.1:$ui_port"
wait "$api_pid" "$ui_pid"
