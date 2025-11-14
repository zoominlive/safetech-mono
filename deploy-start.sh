#!/bin/bash

echo "🚀 Starting SafeTech deployment..."

echo "📦 Starting backend server..."
pnpm --filter ./packages/backend start &
BACKEND_PID=$!

node wait-for-port.js 4000 60
if [ $? -ne 0 ]; then
  echo "❌ Backend failed to start"
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
