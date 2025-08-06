import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import crypto from 'crypto';

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

  // 打印签名对比值
  console.error('hmacHeader:', hmacHeader);
  console.error('generatedHmac:', generatedHmac);

  let isVerified = false;
  try {
    isVerified = crypto.timingSafeEqual(
      Buffer.from(hmacHeader, 'base64'),
      Buffer.from(generatedHmac, 'base64')
    );
  } catch (e) {
    // 如果长度不一致会抛错
    console.error('timingSafeEqual error:', e);
    isVerified = false;
  }

  if (!isVerified) {
    console.error('❌ HMAC 校验失败');
    return res.status(401).send('Unauthorized');
  }

  // 校验通过，打印body内容
  try {
    const data = JSON.parse(rawBody.toString('utf8'));
    console.log('✅ 校验通过，Webhook 数据:', data);
  } catch (e) {
    console.error('Webhook数据解析失败:', e);
  }

  return res.status(200).send('Webhook received');
};

export default handler; 