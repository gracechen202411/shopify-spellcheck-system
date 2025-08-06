# Shopify 多语言产品审核系统

## 📋 项目概述

这是一个基于 Next.js 的全栈系统，用于自动监控 Shopify 新上架商品，对产品标题、描述、主图内文字等进行智能拼写检查，发现错误后自动推送通知，并提供后台界面浏览审查记录。

## ✨ 核心功能

### 🔍 智能OCR识别
- **ChatGPT-4o OCR** (推荐) - 通过 OpenRouter API 调用，识别准确度最高
- **Google Cloud Vision** - 传统OCR服务，准确度较高  
- **Tesseract.js** - 本地OCR引擎，无需API密钥
- **智能引擎选择** - 自动选择最佳OCR引擎，确保识别效果

### 📝 多语言拼写检查
- 支持英文、法文、德文等多种语言
- 使用 GPT-4o 进行智能拼写和语法检查
- 自动识别错误类型（拼写、语法、标点符号）
- 提供详细的修改建议

### 🔔 智能通知系统
- **飞书通知** - 发现问题时自动发送飞书消息
- **邮件通知** - 可配置邮件通知（待扩展）
- **Slack通知** - 可配置Slack通知（待扩展）

### 📊 后台管理界面
- 查看所有检查记录
- 按问题状态筛选
- 显示OCR识别结果
- 展示详细错误信息

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: Prisma + SQLite
- **OCR服务**: ChatGPT-4o / Google Cloud Vision / Tesseract.js
- **AI服务**: OpenRouter API (GPT-4o)
- **通知**: 飞书 Webhook
- **样式**: Tailwind CSS

## 🚀 快速开始

### 1. 环境要求
- Node.js 18+
- npm 或 yarn

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env.local` 文件并配置以下环境变量：

```bash
# Shopify配置
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here

# OpenRouter配置 (用于ChatGPT-4o OCR和拼写检查)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_REFERER=https://your-domain.com
OPENROUTER_TITLE=Shopify产品拼写检查系统

# 飞书配置
FEISHU_WEBHOOK_URL=your_feishu_webhook_url

# 数据库配置
DATABASE_URL="file:./dev.db"

# Google Cloud Vision (可选)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

### 4. 数据库初始化
```bash
export DATABASE_URL="file:./dev.db"
npx prisma db push
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用

## 📱 页面说明

### 1. 工作流测试页面 (`/workflow-test`)
- 测试完整的OCR和拼写检查流程
- 输入图片URL、产品标题和描述
- 查看详细的处理结果

### 2. OCR测试页面 (`/ocr-test`)
- 单独测试OCR功能
- 支持多种OCR引擎
- 实时显示识别进度

### 3. 仪表板页面 (`/dashboard`)
- 查看所有产品检查记录
- 按问题状态筛选
- 显示详细检查结果

## 🔧 API接口

### 1. 完整工作流测试
```bash
POST /api/test-workflow
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "title": "产品标题",
  "bodyHtml": "产品描述"
}
```

### 2. OCR接口
```bash
# ChatGPT-4o OCR
POST /api/ocr/chatgpt-4o

# Google Vision OCR  
POST /api/ocr/google-vision

# Tesseract OCR
POST /api/ocr/tesseract

# 智能OCR (自动选择最佳引擎)
POST /api/ocr/smart
```

### 3. Shopify Webhook
```bash
POST /api/webhooks/shopify-products
```

### 4. 仪表板数据
```bash
GET /api/dashboard/results
```

## 🔄 工作流程

### 1. 产品监控流程
1. **接收Shopify Webhook** - 监听新产品上架事件
2. **OCR文字识别** - 从产品主图提取文字
3. **拼写检查** - 使用GPT-4o检查所有文字内容
4. **问题通知** - 发现问题时发送飞书通知
5. **数据保存** - 将检查结果保存到数据库

### 2. 智能OCR优先级
1. **ChatGPT-4o** (如果配置了 `OPENROUTER_API_KEY`)
2. **Google Cloud Vision** (如果配置了 `GOOGLE_APPLICATION_CREDENTIALS`)
3. **Tesseract.js** (作为最后的回退选项)

## 📊 性能对比

| 引擎 | 准确度 | 速度 | 成本 | 语言支持 |
|------|--------|------|------|----------|
| ChatGPT-4o | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 多语言 |
| Google Vision | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 多语言 |
| Tesseract | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 多语言 |

## 🛠️ 故障排除

### ChatGPT-4o OCR失败
1. 检查 `OPENROUTER_API_KEY` 是否正确设置
2. 确认图片URL是公网可访问的
3. 检查OpenRouter账户余额

### Google Vision OCR失败
1. 检查 `GOOGLE_APPLICATION_CREDENTIALS` 文件路径
2. 确认Google Cloud项目已启用Vision API
3. 检查账户配额和计费

### 数据库连接失败
1. 确认 `DATABASE_URL` 环境变量已设置
2. 运行 `npx prisma db push` 同步数据库
3. 检查SQLite文件权限

## 🔮 后续扩展

- [ ] 支持多店铺识别
- [ ] 多语种自动识别 + 审查
- [ ] 图片违规词识别 / 品牌logo检测
- [ ] 生成日报/周报发送至管理层
- [ ] 审查后一键提交修改建议给运营人员
- [ ] 邮件通知功能
- [ ] Slack通知功能

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 使用前请确保已正确配置所有必需的环境变量，特别是 OpenRouter API Key 和飞书 Webhook URL。 