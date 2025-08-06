# 部署指南

## 🚀 部署选项

本项目支持多种部署平台，推荐使用 Vercel 进行部署。

## 📋 部署前准备

### 1. 环境变量配置

在部署前，请确保以下环境变量已正确配置：

```bash
# 必需配置
OPENROUTER_API_KEY=your_openrouter_api_key_here
FEISHU_WEBHOOK_URL=your_feishu_webhook_url

# 可选配置
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret_here
OPENROUTER_REFERER=https://your-domain.com
OPENROUTER_TITLE=Shopify产品拼写检查系统
```

### 2. 数据库配置

#### 开发环境 (SQLite)
```bash
DATABASE_URL="file:./dev.db"
```

#### 生产环境 (推荐 PostgreSQL)
```bash
# Vercel Postgres
DATABASE_URL="postgresql://username:password@host:port/database"

# Railway Postgres
DATABASE_URL="postgresql://username:password@host:port/database"

# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## 🌐 Vercel 部署

### 1. 准备项目

确保项目已推送到 GitHub 仓库。

### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 配置项目设置

### 3. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
# 必需
OPENROUTER_API_KEY=your_openrouter_api_key_here
FEISHU_WEBHOOK_URL=your_feishu_webhook_url

# 数据库 (推荐使用 Vercel Postgres)
DATABASE_URL=your_postgresql_url_here

# 可选
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret_here
OPENROUTER_REFERER=https://your-domain.com
OPENROUTER_TITLE=Shopify产品拼写检查系统
```

### 4. 数据库设置

#### 使用 Vercel Postgres (推荐)

1. 在 Vercel 项目设置中启用 Postgres
2. 创建数据库实例
3. 复制数据库连接字符串到 `DATABASE_URL`
4. 运行数据库迁移：

```bash
# 在 Vercel 部署时自动运行
npx prisma db push
```

#### 使用外部数据库

如果使用外部数据库，确保：
- 数据库支持 PostgreSQL
- 连接字符串格式正确
- 数据库可以从 Vercel 访问

### 5. 部署

Vercel 会自动检测 Next.js 项目并部署。部署完成后，你会获得一个域名。

## 🚂 Railway 部署

### 1. 准备项目

确保项目已推送到 GitHub 仓库。

### 2. 连接 Railway

1. 访问 [Railway](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的仓库

### 3. 环境变量配置

在 Railway 项目设置中添加环境变量：

```bash
# 必需
OPENROUTER_API_KEY=your_openrouter_api_key_here
FEISHU_WEBHOOK_URL=your_feishu_webhook_url

# 数据库
DATABASE_URL=your_postgresql_url_here

# 可选
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret_here
OPENROUTER_REFERER=https://your-domain.com
OPENROUTER_TITLE=Shopify产品拼写检查系统
```

### 4. 数据库设置

Railway 提供 PostgreSQL 服务：

1. 在 Railway 项目中添加 PostgreSQL 服务
2. 复制数据库连接字符串到 `DATABASE_URL`
3. Railway 会自动运行数据库迁移

### 5. 部署

Railway 会自动检测并部署项目。部署完成后，你会获得一个域名。

## 🐳 Docker 部署

### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://username:password@db:5432/database
      - OPENROUTER_API_KEY=your_openrouter_api_key_here
      - FEISHU_WEBHOOK_URL=your_feishu_webhook_url
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=username
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=database
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. 部署

```bash
# 构建并启动
docker-compose up -d

# 运行数据库迁移
docker-compose exec app npx prisma db push
```

## 🔧 部署后配置

### 1. 验证部署

访问部署后的域名，确认以下功能正常：

- 首页正常显示
- OCR测试功能正常
- 工作流测试功能正常
- 仪表板页面正常

### 2. 配置 Shopify Webhook

如果使用 Shopify Webhook，需要配置 Webhook URL：

```
https://your-domain.com/api/webhooks/shopify-products
```

### 3. 监控和日志

- **Vercel**: 在项目仪表板查看部署日志
- **Railway**: 在项目仪表板查看应用日志
- **Docker**: 使用 `docker-compose logs` 查看日志

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查数据库连接
npx prisma db push

# 检查环境变量
echo $DATABASE_URL
```

#### 2. OCR功能失败

- 检查 `OPENROUTER_API_KEY` 是否正确
- 确认 OpenRouter 账户有足够余额
- 检查图片URL是否可访问

#### 3. 飞书通知失败

- 检查 `FEISHU_WEBHOOK_URL` 是否正确
- 确认飞书机器人配置正确
- 检查网络连接

#### 4. 构建失败

```bash
# 本地测试构建
npm run build

# 检查依赖
npm install
```

### 性能优化

#### 1. 数据库优化

- 使用连接池
- 添加适当的索引
- 定期清理旧数据

#### 2. 缓存策略

- 启用 Next.js 缓存
- 使用 CDN 加速静态资源
- 实现 API 响应缓存

#### 3. 监控告警

- 设置错误监控
- 配置性能监控
- 添加健康检查

## 📞 支持

如果遇到部署问题，请：

1. 检查环境变量配置
2. 查看部署日志
3. 确认数据库连接
4. 测试各个功能模块

---

**注意**: 生产环境部署前，请确保所有敏感信息（API密钥等）已正确配置，并启用 HTTPS。 