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
      'eng+fra+deu+chi_sim', // 添加中文支持
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR进度: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    let extractedText = result.data.text.trim();
    
    // 文本后处理：清理和格式化
    extractedText = extractedText
      .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
      .replace(/\n\s*\n/g, '\n') // 清理多余的换行
      .replace(/[^\w\s.,!?():;"\'-]/g, '') // 移除特殊字符，保留基本标点
      .trim();
    
    console.log('Tesseract OCR提取完成，文字长度:', extractedText.length);
    console.log('Tesseract OCR结果预览:', extractedText.substring(0, 100));
    
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
    
    // 尝试多个不同的prompt
    const prompts = [
      `Extract all text from this image.`,
      `What text do you see in this image?`,
      `Read the text in this image and return it exactly as shown.`
    ];
    
    for (let i = 0; i < prompts.length; i++) {
      try {
        console.log(`尝试prompt ${i + 1}:`, prompts[i]);
        
        const text = await callGpt4oWithImage({
          imageUrl,
          promptText: prompts[i]
        });
        
        console.log('ChatGPT-4o OCR处理完成，文字长度:', text.length);
        console.log('ChatGPT-4o OCR结果预览:', text.substring(0, 100));
        
        // 检查是否是有效结果
        if (text && 
            !text.includes("I'm sorry") && 
            !text.includes("I can't") && 
            !text.includes("I cannot") &&
            text.length > 5) {
          
          return {
            text: text.trim(),
            confidence: 0.98,
            language: 'auto',
            provider: 'chatgpt-4o',
          };
        }
        
        console.log(`Prompt ${i + 1} 返回无效结果，尝试下一个...`);
        
      } catch (error) {
        console.log(`Prompt ${i + 1} 失败:`, error);
        if (i === prompts.length - 1) throw error;
      }
    }
    
    throw new Error('所有prompt都失败了');
    
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
      const result = await extractTextFromImageWithChatGPT4o(imageUrl);
      
      // 检查是否返回了拒绝消息
      if (result.text.includes("I'm sorry") || result.text.includes("I can't") || result.text.length < 10) {
        console.log('ChatGPT-4o返回拒绝消息或结果过短，切换到Google Vision...');
        throw new Error('ChatGPT-4o refused or returned insufficient content');
      }
      
      return result;
    } catch (error) {
      console.log('ChatGPT-4o失败，尝试Google Cloud Vision...');
    }
  }
  
  // 其次使用Google Cloud Vision（如果配置了）
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      console.log('使用Google Cloud Vision进行OCR...');
      return await extractTextFromImageWithGoogleVision(imageUrl);
    } catch (error) {
      console.log('Google Cloud Vision失败，回退到Tesseract');
    }
  }
  
  // 最后回退到Tesseract
  console.log('使用Tesseract进行OCR...');
  return await extractTextFromImage(imageUrl);
} 