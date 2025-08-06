import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { extractTextFromImageSmart } from '../../../lib/ocr';
import { performSpellCheck } from '../../../lib/spellCheck';
import { sendFeishuNotification } from '../../../lib/feishuNotification';
import { saveCheckResult } from '../../../lib/database';

// 验证Shopify Webhook签名
function verifyWebhookSignature(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  return hash === hmacHeader;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 获取Shopify Webhook签名
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const topic = req.headers['x-shopify-topic'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;

    // 验证Webhook主题
    if (topic !== 'products/create') {
      return res.status(400).json({ message: 'Invalid webhook topic' });
    }

    // 验证HMAC签名
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('SHOPIFY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    const rawBody = JSON.stringify(req.body);
    if (!verifyWebhookSignature(rawBody, hmacHeader, webhookSecret)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // 提取产品信息
    const product = req.body;
    const productData = {
      id: product.id,
      title: product.title,
      body_html: product.body_html || '',
      image_src: product.images?.[0]?.src || '',
      created_at: product.created_at,
      shop_domain: shopDomain
    };

    console.log('收到新产品Webhook:', productData);

    // 异步处理产品检查（不阻塞响应）
    processProductCheck(productData).catch(error => {
      console.error('产品检查处理失败:', error);
    });

    res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully' 
    });

  } catch (error) {
    console.error('Webhook处理失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// 异步处理产品检查 - 明确分离OCR和拼写检查
async function processProductCheck(productData: any) {
  try {
    let ocrText = '';

    // 步骤1: 使用智能OCR工具从图片中提取文字（优先使用ChatGPT-4o）
    if (productData.image_src) {
      console.log('开始智能OCR提取图片文字...');
      const ocrResult = await extractTextFromImageSmart(productData.image_src);
      ocrText = ocrResult.text;
      console.log(`OCR提取完成 (使用${ocrResult.provider})，文字内容:`, ocrText.substring(0, 100) + '...');
    }

    // 步骤2: 使用GPT-4o仅对文字进行拼写检查
    console.log('开始拼写检查...');
    const spellCheckResult = await performSpellCheck(
      productData.title,
      productData.body_html,
      ocrText
    );

    // 步骤3: 如果有问题，发送飞书通知
    if (spellCheckResult.hasIssues) {
      console.log('发现问题，发送通知...');
      await sendFeishuNotification(productData, spellCheckResult, ocrText);
    }

    // 步骤4: 保存结果到数据库（可选）
    await saveCheckResult(productData, spellCheckResult, ocrText);

    console.log('产品检查处理完成');

  } catch (error) {
    console.error('产品检查处理失败:', error);
  }
} 