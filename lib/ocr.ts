import Tesseract from 'tesseract.js';
import { extractTextFromImage as extractTextWithGoogleVision } from './ocr-google';
import { callGpt4oWithImage } from './openrouter';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  provider: 'tesseract' | 'google-vision' | 'chatgpt-4o';
}

// 原有的Tesseract OCR函数
export async function extractTextFromImage(imageUrl: string): Promise<OCRResult> {
  try {
    console.log('开始Tesseract OCR处理:', imageUrl);
    
    const result = await Tesseract.recognize(
      imageUrl,
      'eng+fra+deu',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR进度: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    const extractedText = result.data.text.trim();
    console.log('Tesseract OCR提取完成，文字长度:', extractedText.length);
    
    return {
      text: extractedText,
      confidence: result.data.confidence,
      language: (result.data as any).language || 'unknown',
      provider: 'tesseract',
    };
  } catch (error) {
    console.error('Tesseract OCR处理失败:', error);
    return {
      text: '',
      confidence: 0,
      language: 'unknown',
      provider: 'tesseract',
    };
  }
}

// 新增：使用Google Cloud Vision的OCR函数
export async function extractTextFromImageWithGoogleVision(imageUrl: string): Promise<OCRResult> {
  try {
    console.log('开始Google Cloud Vision OCR处理:', imageUrl);
    
    const text = await extractTextWithGoogleVision(imageUrl);
    
    return {
      text,
      confidence: 0.95, // Google Vision通常很准确
      language: 'auto',
      provider: 'google-vision',
    };
  } catch (error) {
    console.error('Google Cloud Vision OCR处理失败:', error);
    return {
      text: '',
      confidence: 0,
      language: 'unknown',
      provider: 'google-vision',
    };
  }
}

// 新增：使用ChatGPT-4o的OCR函数
export async function extractTextFromImageWithChatGPT4o(imageUrl: string): Promise<OCRResult> {
  try {
    console.log('开始ChatGPT-4o OCR处理:', imageUrl);
    
    const prompt = `You are an OCR (Optical Character Recognition) system. Your task is to extract and transcribe all visible text from the provided image.

Instructions:
1. Identify and extract ALL visible text in the image
2. Maintain the original text order and layout
3. Preserve the exact spelling and case of the text
4. If the text is in French, German, or any other language, transcribe it exactly as shown
5. Include decorative text, labels, signs, and any other written content
6. Return ONLY the extracted text, no explanations or comments
7. If there are multiple lines, separate them with line breaks
8. Do not add any interpretation or translation

Please extract and return all text visible in this image:`;

    const text = await callGpt4oWithImage({
      imageUrl,
      promptText: prompt
    });
    
    console.log('ChatGPT-4o OCR处理完成，文字长度:', text.length);
    console.log('ChatGPT-4o OCR结果预览:', text.substring(0, 100));
    
    return {
      text: text.trim(),
      confidence: 0.98, // ChatGPT-4o通常非常准确
      language: 'auto',
      provider: 'chatgpt-4o',
    };
  } catch (error) {
    console.error('ChatGPT-4o OCR处理失败:', error);
    return {
      text: '',
      confidence: 0,
      language: 'unknown',
      provider: 'chatgpt-4o',
    };
  }
}

// 智能选择OCR提供商
export async function extractTextFromImageSmart(imageUrl: string): Promise<OCRResult> {
  // 优先使用ChatGPT-4o（如果配置了OpenRouter API Key）
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log('尝试使用ChatGPT-4o进行OCR...');
      return await extractTextFromImageWithChatGPT4o(imageUrl);
    } catch (error) {
      console.log('ChatGPT-4o失败，尝试Google Cloud Vision...');
    }
  }
  
  // 其次使用Google Cloud Vision（如果配置了）
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await extractTextFromImageWithGoogleVision(imageUrl);
    } catch (error) {
      console.log('Google Cloud Vision失败，回退到Tesseract');
    }
  }
  
  // 最后回退到Tesseract
  return await extractTextFromImage(imageUrl);
} 