import { NextApiRequest, NextApiResponse } from 'next';
import { extractTextFromImageSmart } from '../../lib/ocr';
import { performSpellCheck } from '../../lib/spellCheck';
import { sendFeishuNotification } from '../../lib/feishuNotification';
import { saveCheckResult } from '../../lib/database';
import { extractShopifyProductFromUrl } from '../../lib/shopifyExtractor';

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

    // 从Shopify URL提取真实产品信息
    console.log('🔍 步骤0: 提取Shopify产品信息...');
    const shopifyProduct = await extractShopifyProductFromUrl(shopifyUrl);
    
    if (!shopifyProduct) {
      return res.status(400).json({ 
        success: false,
        error: '无法从提供的URL提取产品信息，请检查URL是否正确',
        workflow: {
          productExtracted: false,
          ocrCompleted: false,
          spellCheckCompleted: false,
          notificationSent: false,
          databaseSaved: false
        }
      });
    }

    // 转换为兼容格式
    const productData = {
      id: shopifyProduct.id,
      title: shopifyProduct.title,
      body_html: shopifyProduct.body_html,
      image_src: shopifyProduct.image_src,
      created_at: shopifyProduct.created_at,
      shop_domain: shopifyProduct.shop_domain
    };

    console.log('✅ 产品信息提取成功:', {
      id: productData.id,
      title: productData.title,
      shop: productData.shop_domain,
      hasImage: !!productData.image_src
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
          extractedProductId: shopifyProduct.id,
          extractedShopDomain: shopifyProduct.shop_domain
        },
        product: {
          id: productData.id,
          title: productData.title,
          imageUrl: productData.image_src,
          shopDomain: productData.shop_domain,
          vendor: shopifyProduct.vendor,
          productType: shopifyProduct.product_type,
          price: shopifyProduct.price,
          handle: shopifyProduct.handle
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
          productExtracted: true,
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
        productExtracted: false,
        ocrCompleted: false,
        spellCheckCompleted: false,
        notificationSent: false,
        databaseSaved: false
      }
    });
  }
} 