import { PrismaClient } from '@prisma/client';
import { SpellCheckResult } from './spellCheck';

const prisma = new PrismaClient();

export async function saveCheckResult(
  productData: any,
  spellCheckResult: SpellCheckResult,
  ocrText: string
): Promise<void> {
  try {
    await prisma.productCheck.create({
      data: {
        shopifyId: productData.id,
        title: productData.title,
        description: productData.body_html,
        imageUrl: productData.image_src,
        hasIssues: spellCheckResult.hasIssues,
        issueCount: spellCheckResult.issues.length,
        quality: spellCheckResult.overallQuality,
        issues: JSON.stringify(spellCheckResult.issues), // 正确序列化JSON
        ocrText,
        summary: spellCheckResult.summary,
        notified: spellCheckResult.hasIssues,
      },
    });
    
    console.log('检查结果已保存到数据库');
  } catch (error) {
    console.error('保存检查结果失败:', error);
  }
}

// 新增：获取检查结果的函数
export async function getCheckResults(limit: number = 50) {
  try {
    const results = await prisma.productCheck.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    // 解析issues字段
    return results.map((result: any) => ({
      ...result,
      issues: result.issues ? JSON.parse(result.issues) : []
    }));
  } catch (error) {
    console.error('获取检查结果失败:', error);
    return [];
  }
}

// 新增：根据ID获取单个检查结果
export async function getCheckResultById(id: string) {
  try {
    const result = await prisma.productCheck.findUnique({
      where: { id }
    });
    
    if (result) {
      return {
        ...result,
        issues: result.issues ? JSON.parse(result.issues) : []
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取检查结果失败:', error);
    return null;
  }
} 