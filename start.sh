#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")" && pwd)"
cd "$project_dir"

# MongoDB remains mandatory outside isolated acceptance runs. The test-only
# adapter is process-local and cannot be enabled in development or production.
if [[ "${NODE_ENV:-}" == "test" ]]; then
  export RUNTIME_IN_MEMORY_AUTH=true
fi

exec node react_api/server.js
