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
    const { shopifyUrl } = req.body;

    if (!shopifyUrl) {
      return res.status(400).json({ error: 'Missing shopifyUrl parameter' });
    }

    console.log('=== 开始Shopify URL测试 ===');
    console.log('Shopify URL:', shopifyUrl);

    // 从URL中提取产品信息（这里简化处理，实际应该调用Shopify API）
    const urlParts = shopifyUrl.split('/');
    const productId = urlParts[urlParts.length - 1] || 'unknown';
    const shopDomain = urlParts[2] || 'unknown-shop.myshopify.com';

    // 模拟产品数据（实际应该从Shopify API获取）
    const productData = {
      id: productId,
      title: 'Shopify测试产品 - 高质量T恤衫',
      body_html: '<p>这是一件高质量的T恤衫，采用100%纯棉材质制作。舒适透气，适合日常穿着。</p>',
      image_src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
      created_at: new Date().toISOString(),
      shop_domain: shopDomain
    };

    console.log('📦 模拟产品数据:', {
      id: productData.id,
      title: productData.title,
      shop: productData.shop_domain
    });

    let ocrText = '';
    let ocrProvider = '';

    // 步骤1: 使用智能OCR工具从图片中提取文字
    if (productData.image_src) {
      console.log('🔄 步骤1: 开始智能OCR提取图片文字...');
      try {
        const ocrResult = await extractTextFromImageSmart(productData.image_src);
        ocrText = ocrResult.text;
        ocrProvider = ocrResult.provider;
        console.log(`✅ OCR提取完成 (使用${ocrResult.provider})`);
        console.log(`📝 识别文字内容:`, ocrText);
      } catch (ocrError) {
        console.error('❌ OCR提取失败:', ocrError);
        ocrText = '图片文字提取失败';
        ocrProvider = 'failed';
      }
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

    // 步骤3: 发送飞书通知（无论是否有问题都发送）
    console.log('🔄 步骤3: 准备发送飞书通知...');
    let notificationSent = false;
    try {
      await sendFeishuNotification(productData, spellCheckResult, ocrText, true);
      console.log('✅ 飞书通知发送成功');
      notificationSent = true;
    } catch (notificationError) {
      console.error('❌ 飞书通知发送失败:', notificationError);
    }

    // 步骤4: 保存结果到数据库
    console.log('🔄 步骤4: 保存结果到数据库...');
    let databaseSaved = false;
    try {
      await saveCheckResult(productData, spellCheckResult, ocrText);
      console.log('✅ 数据库保存成功');
      databaseSaved = true;
    } catch (dbError) {
      console.error('❌ 数据库保存失败:', dbError);
    }

    console.log('=== Shopify URL测试完成 ===');

    res.status(200).json({
      success: true,
      message: 'Shopify URL测试完成',
      data: {
        input: {
          shopifyUrl,
          extractedProductId: productId,
          extractedShopDomain: shopDomain
        },
        product: {
          id: productData.id,
          title: productData.title,
          imageUrl: productData.image_src,
          shopDomain: productData.shop_domain
        },
        ocr: {
          provider: ocrProvider,
          text: ocrText,
          textLength: ocrText.length,
          success: ocrProvider !== 'failed'
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
          ocrCompleted: ocrProvider !== 'failed',
          spellCheckCompleted: true,
          notificationSent: notificationSent,
          databaseSaved: databaseSaved
        }
      }
    });

  } catch (error) {
    console.error('❌ Shopify URL测试失败:', error);
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