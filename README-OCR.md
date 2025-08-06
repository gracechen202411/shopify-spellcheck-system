# OCR功能使用说明

## 概述

本项目集成了三种OCR（光学字符识别）引擎：
1. **ChatGPT-4o** (推荐) - 通过OpenRouter API调用，识别准确度最高
2. **Google Cloud Vision** - 传统OCR服务，准确度较高
3. **Tesseract.js** - 本地OCR引擎，无需API密钥

## 环境变量配置

### 必需配置

```bash
# OpenRouter API密钥 (用于ChatGPT-4o OCR)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Google Cloud Vision (可选)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Shopify Webhook
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret_here
```

### 可选配置

```bash
# OpenRouter额外配置
OPENROUTER_REFERER=https://your-site.com
OPENROUTER_TITLE=Your Site Name
```

## 使用方法

### 1. 测试页面

访问 `/ocr-test` 页面进行OCR功能测试：

```bash
npm run dev
# 然后访问 http://localhost:3000/ocr-test
```

### 2. API调用

#### 单独测试ChatGPT-4o OCR

```bash
curl -X POST http://localhost:3000/api/ocr/chatgpt-4o \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

#### 智能OCR（自动选择最佳引擎）

```javascript
import { extractTextFromImageSmart } from '../lib/ocr';

const result = await extractTextFromImageSmart(imageUrl);
console.log(`使用${result.provider}识别结果:`, result.text);
```

### 3. 工作流集成

在Shopify产品监控工作流中，系统会自动使用智能OCR：

```javascript
// 在 pages/api/webhooks/shopify-products.ts 中
const ocrResult = await extractTextFromImageSmart(productData.image_src);
```

## 优先级策略

智能OCR函数 `extractTextFromImageSmart` 按以下优先级选择引擎：

1. **ChatGPT-4o** (如果配置了 `OPENROUTER_API_KEY`)
2. **Google Cloud Vision** (如果配置了 `GOOGLE_APPLICATION_CREDENTIALS`)
3. **Tesseract.js** (作为最后的回退选项)

## 性能对比

| 引擎 | 准确度 | 速度 | 成本 | 语言支持 |
|------|--------|------|------|----------|
| ChatGPT-4o | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 多语言 |
| Google Vision | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 多语言 |
| Tesseract | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 多语言 |

## 故障排除

### ChatGPT-4o OCR失败

1. 检查 `OPENROUTER_API_KEY` 是否正确设置
2. 确认图片URL是公网可访问的
3. 检查OpenRouter账户余额

### Google Vision OCR失败

1. 检查 `GOOGLE_APPLICATION_CREDENTIALS` 文件路径
2. 确认Google Cloud项目已启用Vision API
3. 检查账户配额和计费

### Tesseract OCR失败

1. 确认已安装Tesseract.js依赖
2. 检查图片格式是否支持
3. 确认图片URL可访问

## 示例响应

### 成功响应

```json
{
  "success": true,
  "data": {
    "text": "ATTENTION\nUNE ACCRO AUX\nPlantes\nMONICA\nVIT ICI\nJARDIN",
    "confidence": 0.98,
    "language": "auto",
    "provider": "chatgpt-4o"
  },
  "debug": {
    "textLength": 45,
    "hasCredentials": true,
    "timestamp": "2025-01-06T05:12:43.653Z"
  }
}
```

### 失败响应

```json
{
  "success": false,
  "error": "Missing OPENROUTER_API_KEY in environment variables",
  "debug": {
    "hasCredentials": false,
    "timestamp": "2025-01-06T05:12:43.653Z"
  }
}
```

## 注意事项

1. **图片URL要求**: 所有OCR引擎都需要图片URL是公网可访问的
2. **API限制**: 注意各服务的API调用限制和计费
3. **语言支持**: ChatGPT-4o对多语言和艺术字体支持最好
4. **隐私**: 图片会发送到第三方服务进行处理，注意隐私合规 