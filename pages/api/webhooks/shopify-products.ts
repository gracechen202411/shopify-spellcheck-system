import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import crypto from 'crypto';
import { extractTextFromImageSmart } from '../../../lib/ocr';
import { performSpellCheck } from '../../../lib/spellCheck';
import { sendFeishuNotification } from '../../../lib/feishuNotification';
import { saveCheckResult } from '../../../lib/database';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const rawBody = await buffer(req);
  const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET!;
  const generatedHmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  let isVerified = false;
  try {
    isVerified = crypto.timingSafeEqual(
      Buffer.from(hmacHeader, 'base64'),
      Buffer.from(generatedHmac, 'base64')
    );
  } catch (e) {
    console.error('timingSafeEqual error:', e);
    isVerified = false;
  }

  if (!isVerified) {
    console.error('❌ HMAC 校验失败');
    return res.status(401).send('Unauthorized');
    }

  // 校验通过，进入业务逻辑
  let product;
  try {
    product = JSON.parse(rawBody.toString('utf8'));
    console.log('✅ 校验通过，Webhook 数据:', product);
  } catch (e) {
    console.error('Webhook数据解析失败:', e);
    return res.status(400).send('Invalid JSON');
    }

  // 1. 提取产品信息
    const productData = {
      id: product.id,
      title: product.title,
      body_html: product.body_html || '',
      image_src: product.images?.[0]?.src || '',
      created_at: product.created_at,
    shop_domain: product.vendor || '' // 可根据实际需求调整
  };

  // 2. OCR图片文字识别
    let ocrText = '';
    if (productData.image_src) {
    try {
      const ocrResult = await extractTextFromImageSmart(productData.image_src);
      ocrText = ocrResult.text;
      console.log('OCR识别结果:', ocrText);
    } catch (e) {
      console.error('OCR识别失败:', e);
    }
  }

  // 3. 拼写检查（用你优化后的prompt）
  // 兜底类型，补全所有必需字段
  let spellCheckResult: any;
  try {
    spellCheckResult = await performSpellCheck(
      productData.title,
      productData.body_html,
      ocrText
    );
    console.log('拼写检查结果:', spellCheckResult);
  } catch (e) {
    console.error('拼写检查失败:', e);
    spellCheckResult = {
      hasIssues: false,
      issues: [],
      overallQuality: 'unknown',
      summary: '拼写检查失败',
      confidence: 0,
    };
  }

  // 4. 有问题推送飞书
    if (spellCheckResult.hasIssues) {
    try {
      await sendFeishuNotification(productData, spellCheckResult, ocrText);
      console.log('已推送飞书通知');
    } catch (e) {
      console.error('飞书通知失败:', e);
    }
    }

  // 5. 保存检查结果
  try {
    await saveCheckResult(productData, spellCheckResult, ocrText);
    console.log('已保存检查结果');
  } catch (e) {
    console.error('保存检查结果失败:', e);
  }

  return res.status(200).send('Webhook received');
};

export default handler; 