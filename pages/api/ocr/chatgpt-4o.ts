import { NextApiRequest, NextApiResponse } from 'next';
import { extractTextFromImageWithChatGPT4o } from '../../../lib/ocr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing imageUrl parameter' });
    }

    console.log('开始ChatGPT-4o OCR处理:', imageUrl);

    const result = await extractTextFromImageWithChatGPT4o(imageUrl);

    console.log('ChatGPT-4o OCR处理完成，文字长度:', result.text.length);
    console.log('ChatGPT-4o OCR结果预览:', result.text.substring(0, 100));

    res.status(200).json({
      success: true,
      data: result,
      debug: {
        textLength: result.text.length,
        hasCredentials: !!process.env.OPENROUTER_API_KEY,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('ChatGPT-4o OCR处理失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        hasCredentials: !!process.env.OPENROUTER_API_KEY,
        timestamp: new Date().toISOString()
      }
    });
  }
} 