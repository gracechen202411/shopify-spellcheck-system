import { NextApiRequest, NextApiResponse } from 'next';
import { saveCheckResult } from '../../lib/database';
import { SpellCheckResult, SpellCheckIssue } from '../../lib/spellCheck';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 创建测试数据
    const testData = [
      {
        productData: {
          id: 'test-product-1',
          title: 'Monica & Thomas - UNE FOLLE DES PLANTES',
          body_html: 'Beautiful garden products for plant lovers',
          image_src: 'https://evridwearcustom.fr/cdn/shop/files/mk6_10.png',
          created_at: new Date().toISOString(),
          shop_domain: 'evridwearcustom.fr'
        },
        spellCheckResult: {
          hasIssues: true,
          issues: [
            {
              type: 'spelling' as const,
              location: 'title' as const,
              original: 'FOLLE',
              suggestion: 'FOLLE (correct)'
            },
            {
              type: 'grammar' as const,
              location: 'description' as const,
              original: 'Beautiful garden products',
              suggestion: 'Beautiful garden products (correct)'
            }
          ] as SpellCheckIssue[],
          overallQuality: 'needs_improvement' as const,
          summary: '产品标题和描述基本正确，但有一些小问题需要优化',
          confidence: 0.85
        } as SpellCheckResult,
        ocrText: 'Monica & Thomas\nUNE FOLLE DES PLANTES\nET UN VIEUX GRINCHEUX\nJARDINENT ICI'
      },
      {
        productData: {
          id: 'test-product-2',
          title: 'ATTENTION ZONE PATROUILLÉE',
          body_html: 'Security zone with 24/7 monitoring',
          image_src: 'https://evridwearcustom.fr/cdn/shop/files/2_49595550-5729-4210-8c61-a1fbfc72b29d.png',
          created_at: new Date().toISOString(),
          shop_domain: 'evridwearcustom.fr'
        },
        spellCheckResult: {
          hasIssues: false,
          issues: [],
          overallQuality: 'excellent' as const,
          summary: '产品信息完美，没有发现任何问题',
          confidence: 0.95
        } as SpellCheckResult,
        ocrText: 'ATTENTION\nZONE PATROUILLÉE PAR\nCharile\nLouis\nPeach\nSÉCURITÉ 24H/24'
      },
      {
        productData: {
          id: 'test-product-3',
          title: 'Garden Tools Collection',
          body_html: 'High quality garden tools for professional use',
          image_src: 'https://example.com/garden-tools.jpg',
          created_at: new Date().toISOString(),
          shop_domain: 'gardenshop.com'
        },
        spellCheckResult: {
          hasIssues: true,
          issues: [
            {
              type: 'spelling' as const,
              location: 'title' as const,
              original: 'Tools',
              suggestion: 'Tools (correct)'
            }
          ] as SpellCheckIssue[],
          overallQuality: 'good' as const,
          summary: '产品信息基本正确，只有一个小拼写问题',
          confidence: 0.90
        } as SpellCheckResult,
        ocrText: 'Garden Tools Collection\nProfessional Quality'
      }
    ];

    // 保存测试数据到数据库
    for (const data of testData) {
      await saveCheckResult(
        data.productData,
        data.spellCheckResult,
        data.ocrText
      );
    }

    res.status(200).json({
      success: true,
      message: '测试数据已创建',
      count: testData.length
    });

  } catch (error) {
    console.error('创建测试数据失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 