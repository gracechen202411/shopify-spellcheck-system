import { NextApiRequest, NextApiResponse } from 'next';
import Tesseract from 'tesseract.js';

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

    console.log('开始Tesseract OCR处理:', imageUrl);
    
    const result = await Tesseract.recognize(
      imageUrl,
      'eng+fra+deu', // 支持英文、法文、德文
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`Tesseract OCR进度: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    const extractedText = result.data.text.trim();
    
    console.log('Tesseract OCR处理完成，文字长度:', extractedText.length);
    console.log('Tesseract OCR结果预览:', extractedText.substring(0, 100));
    
    res.status(200).json({
      success: true,
      text: extractedText,
      provider: 'tesseract',
      confidence: result.data.confidence,
      debug: {
        textLength: extractedText.length,
        confidence: result.data.confidence,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Tesseract OCR处理失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 