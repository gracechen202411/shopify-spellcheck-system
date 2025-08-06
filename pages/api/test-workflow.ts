import { NextApiRequest, NextApiResponse } from 'next';
import { extractTextFromImageSmart } from '../../lib/ocr';
import { performSpellCheck } from '../../lib/spellCheck';
import { sendFeishuNotification } from '../../lib/feishuNotification';
import { saveCheckResult } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, title, bodyHtml } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing imageUrl parameter' });
    }

    console.log('=== 开始测试完整工作流 ===');
    console.log('测试图片URL:', imageUrl);
    console.log('产品标题:', title || '无标题');
    console.log('产品描述:', bodyHtml || '无描述');

    // 模拟产品数据
    const productData = {
      id: 'test-product-123',
      title: title || 'Test Product',
      body_html: bodyHtml || '',
      image_src: imageUrl,
      created_at: new Date().toISOString(),
      shop_domain: 'test-shop.myshopify.com'
    };

    let ocrText = '';
    let ocrProvider = '';

    // 步骤1: 使用智能OCR工具从图片中提取文字（优先使用ChatGPT-4o）
    if (productData.image_src) {
      console.log('🔄 步骤1: 开始智能OCR提取图片文字...');
      const ocrResult = await extractTextFromImageSmart(productData.image_src);
      ocrText = ocrResult.text;
      ocrProvider = ocrResult.provider;
      console.log(`✅ OCR提取完成 (使用${ocrResult.provider})`);
      console.log(`📝 识别文字内容:`, ocrText);
    }

    // 步骤2: 使用GPT-4o进行拼写检查
    console.log('🔄 步骤2: 开始拼写检查...');
    const spellCheckResult = await performSpellCheck(
      productData.title,
      productData.body_html,
      ocrText
    );
    console.log('✅ 拼写检查完成');
    console.log('📊 检查结果:', {
      hasIssues: spellCheckResult.hasIssues,
      issuesCount: spellCheckResult.issues?.length || 0,
      overallQuality: spellCheckResult.overallQuality,
      confidence: spellCheckResult.confidence
    });

    // 步骤3: 如果有问题，发送飞书通知
    if (spellCheckResult.hasIssues) {
      console.log('🔄 步骤3: 发现问题，准备发送飞书通知...');
      try {
        await sendFeishuNotification(productData, spellCheckResult, ocrText);
        console.log('✅ 飞书通知发送成功');
      } catch (notificationError) {
        console.error('❌ 飞书通知发送失败:', notificationError);
      }
    } else {
      console.log('✅ 步骤3: 未发现问题，无需发送通知');
    }

    // 步骤4: 保存结果到数据库
    console.log('🔄 步骤4: 保存结果到数据库...');
    try {
      await saveCheckResult(productData, spellCheckResult, ocrText);
      console.log('✅ 数据库保存成功');
    } catch (dbError) {
      console.error('❌ 数据库保存失败:', dbError);
    }

    console.log('=== 完整工作流测试完成 ===');

    res.status(200).json({
      success: true,
      message: '完整工作流测试完成',
      data: {
        product: {
          id: productData.id,
          title: productData.title,
          imageUrl: productData.image_src
        },
        ocr: {
          provider: ocrProvider,
          text: ocrText,
          textLength: ocrText.length
        },
        spellCheck: {
          hasIssues: spellCheckResult.hasIssues,
          issuesCount: spellCheckResult.issues?.length || 0,
          overallQuality: spellCheckResult.overallQuality,
          confidence: spellCheckResult.confidence,
          issues: spellCheckResult.issues,
          summary: spellCheckResult.summary
        },
        workflow: {
          ocrCompleted: true,
          spellCheckCompleted: true,
          notificationSent: spellCheckResult.hasIssues,
          databaseSaved: true
        }
      }
    });

  } catch (error) {
    console.error('❌ 工作流测试失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      workflow: {
        ocrCompleted: false,
        spellCheckCompleted: false,
        notificationSent: false,
        databaseSaved: false
      }
    });
  }
} 