import { NextApiRequest, NextApiResponse } from 'next';
import { extractTextFromImage } from '../../../lib/ocr-google';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    console.log('开始Google Cloud Vision OCR处理:', imageUrl);
    console.log('环境变量检查:', {
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    
    const text = await extractTextFromImage(imageUrl);
    
    console.log('OCR处理完成，文字长度:', text.length);
    console.log('OCR结果预览:', text.substring(0, 100));
    
    res.status(200).json({
      success: true,
      text: text,
      provider: 'google-vision',
      debug: {
        textLength: text.length,
        hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Google Cloud Vision OCR处理失败:', error);
    console.error('错误详情:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        timestamp: new Date().toISOString()
      }
    });
  }
} 