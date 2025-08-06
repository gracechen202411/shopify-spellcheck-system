#!/bin/bash

# 数据库迁移 (如果使用 PostgreSQL)
if [[ "$DATABASE_URL" == postgresql://* ]]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
fi

# 构建和启动应用
echo "Building and starting the application..."
npm run build && npm start 