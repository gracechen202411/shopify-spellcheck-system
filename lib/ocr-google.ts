import { ImageAnnotatorClient } from '@google-cloud/vision';

// 初始化Google Cloud Vision客户端
const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface GoogleVisionOCRResult {
  text: string;
  confidence: number;
  language: string;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 使用 Google Cloud Vision API 识别图片中的文本
 * @param imagePathOrUrl 图片路径或URL
 * @returns 识别出的文本内容
 */
export async function extractTextFromImage(imagePathOrUrl: string): Promise<string> {
  try {
    console.log('开始Google Cloud Vision OCR处理:', imagePathOrUrl);

    // 构建请求参数
    const request = {
      image: {
        source: {
          imageUri: imagePathOrUrl,
        },
      },
      features: [
        {
          type: 'TEXT_DETECTION' as const,
          maxResults: 50,
        },
      ],
      imageContext: {
        languageHints: ['fr', 'en', 'de'], // 优先法语、英语、德语
        textDetectionParams: {
          enableTextDetectionConfidenceScore: true,
        },
      },
    };

    // 调用Google Cloud Vision API
    const [result] = await vision.annotateImage(request);
    
    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      console.log('未检测到文字内容');
      return '';
    }

    // 提取完整文本（第一个annotation包含所有文本）
    const fullText = result.textAnnotations[0].description || '';
    
    // 清理文本：去掉多余换行，保留有意义的换行
    const cleanedText = fullText
      .replace(/\n\s*\n/g, '\n') // 将多个连续换行替换为单个换行
      .replace(/^\s+|\s+$/g, '') // 去掉首尾空白
      .trim();
    
    console.log('Google Cloud Vision OCR提取完成，文字长度:', cleanedText.length);
    
    return cleanedText;

  } catch (error) {
    console.error('Google Cloud Vision OCR处理失败:', error);
    return '';
  }
}

/**
 * 使用 Google Cloud Vision OCR 提取远程图片中的文本内容（详细版本）
 * 返回更多信息包括置信度和文本块位置
 * @param imageUrl 图片的公网可访问地址
 * @returns 详细的OCR结果
 */
export async function extractTextWithGoogleVisionDetailed(imageUrl: string): Promise<GoogleVisionOCRResult> {
  try {
    console.log('开始Google Cloud Vision OCR详细处理:', imageUrl);

    const request = {
      image: {
        source: {
          imageUri: imageUrl,
        },
      },
      features: [
        {
          type: 'TEXT_DETECTION' as const,
          maxResults: 100,
        },
      ],
      imageContext: {
        languageHints: ['fr', 'en', 'de'], // 法语、英语、德语
        textDetectionParams: {
          enableTextDetectionConfidenceScore: true,
        },
      },
    };

    const [result] = await vision.annotateImage(request);
    
    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      return {
        text: '',
        confidence: 0,
        language: 'unknown',
        blocks: [],
      };
    }

    // 提取完整文本
    const fullText = result.textAnnotations[0].description || '';
    
    // 提取文本块信息（跳过第一个，因为它包含所有文本）
    const textBlocks: TextBlock[] = result.textAnnotations.slice(1).map(annotation => {
      const vertices = annotation.boundingPoly?.vertices || [];
      const x = Math.min(...vertices.map(v => v.x || 0));
      const y = Math.min(...vertices.map(v => v.y || 0));
      const width = Math.max(...vertices.map(v => v.x || 0)) - x;
      const height = Math.max(...vertices.map(v => v.y || 0)) - y;

      return {
        text: annotation.description || '',
        confidence: annotation.confidence || 0,
        boundingBox: { x, y, width, height },
      };
    });

    // 计算整体置信度
    const avgConfidence = textBlocks.length > 0 
      ? textBlocks.reduce((sum, block) => sum + block.confidence, 0) / textBlocks.length
      : 0;

    // 检测主要语言
    const language = detectLanguage(fullText);

    console.log('Google Cloud Vision OCR详细处理完成');
    
    return {
      text: fullText.trim(),
      confidence: avgConfidence,
      language,
      blocks: textBlocks,
    };

  } catch (error) {
    console.error('Google Cloud Vision OCR详细处理失败:', error);
    throw new Error(`OCR处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 简单的语言检测（基于常见词汇）
 * @param text 要检测的文本
 * @returns 检测到的语言代码
 */
function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // 法语特征词
  const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'avec', 'pour', 'sur', 'dans', 'par', 'de', 'du', 'des'];
  // 德语特征词
  const germanWords = ['der', 'die', 'das', 'und', 'oder', 'mit', 'für', 'auf', 'in', 'von', 'zu', 'den', 'dem', 'des'];
  // 英语特征词
  const englishWords = ['the', 'and', 'or', 'with', 'for', 'on', 'in', 'at', 'to', 'of', 'a', 'an', 'is', 'are', 'was', 'were'];

  let frenchCount = 0;
  let germanCount = 0;
  let englishCount = 0;

  frenchWords.forEach(word => {
    if (lowerText.includes(word)) frenchCount++;
  });
  germanWords.forEach(word => {
    if (lowerText.includes(word)) germanCount++;
  });
  englishWords.forEach(word => {
    if (lowerText.includes(word)) englishCount++;
  });

  if (frenchCount > germanCount && frenchCount > englishCount) return 'fr';
  if (germanCount > frenchCount && germanCount > englishCount) return 'de';
  if (englishCount > frenchCount && englishCount > germanCount) return 'en';
  
  return 'unknown';
}

/**
 * 批量处理多张图片
 * @param imageUrls 图片URL数组
 * @returns OCR结果数组
 */
export async function extractTextFromMultipleImages(imageUrls: string[]): Promise<string[]> {
  const results: string[] = [];
  
  for (const imageUrl of imageUrls) {
    try {
      const text = await extractTextFromImage(imageUrl);
      results.push(text);
    } catch (error) {
      console.error(`处理图片 ${imageUrl} 失败:`, error);
      results.push('');
    }
  }
  
  return results;
}

/**
 * 验证Google Cloud Vision服务是否可用
 * @returns 是否可用
 */
export async function testGoogleVisionConnection(): Promise<boolean> {
  try {
    // 使用一个简单的测试图片
    const testImageUrl = 'https://via.placeholder.com/100x50/000000/FFFFFF?text=Test';
    await extractTextFromImage(testImageUrl);
    return true;
  } catch (error) {
    console.error('Google Cloud Vision连接测试失败:', error);
    return false;
  }
} 