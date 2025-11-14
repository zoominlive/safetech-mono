#!/bin/bash

echo "🚀 Starting SafeTech deployment..."

echo "📦 Starting backend server..."
pnpm --filter ./packages/backend start 2>&1 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
sleep 2

node wait-for-port.js 4000 120
if [ $? -ne 0 ]; then
  echo "❌ Backend failed to start within timeout"
  echo "Checking if backend process is still running..."
  if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "⚠️  Backend process is still running but port not accessible"
  else
    echo "❌ Backend process has exited"
  fi
  exit 1
fi

echo "🌐 Starting frontend preview server..."
pnpm --filter ./packages/frontend preview --host 0.0.0.0 --port 5000 &
FRONTEND_PID=$!

echo "✅ Both servers started successfully!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"

wait -n
exit $?
