import { 
  extractTextWithGoogleVision, 
  extractTextWithGoogleVisionDetailed,
  testGoogleVisionConnection 
} from './ocr-google';

// 使用示例
export async function exampleUsage() {
  try {
    // 1. 测试连接
    const isConnected = await testGoogleVisionConnection();
    console.log('Google Cloud Vision连接状态:', isConnected);

    if (!isConnected) {
      throw new Error('Google Cloud Vision服务不可用');
    }

    // 2. 简单文本提取
    const imageUrl = 'https://example.com/french-product-image.jpg';
    const simpleText = await extractTextWithGoogleVision(imageUrl);
    console.log('提取的文本:', simpleText);

    // 3. 详细文本提取
    const detailedResult = await extractTextWithGoogleVisionDetailed(imageUrl);
    console.log('详细结果:', {
      text: detailedResult.text,
      confidence: detailedResult.confidence,
      language: detailedResult.language,
      blockCount: detailedResult.blocks.length,
    });

    // 4. 批量处理
    const multipleUrls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ];
    const batchResults = await extractTextFromMultipleImages(multipleUrls);
    console.log('批量处理结果:', batchResults);

  } catch (error) {
    console.error('示例执行失败:', error);
  }
} 