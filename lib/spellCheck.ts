import { callGpt4oWithText } from './openrouter';

export interface SpellCheckIssue {
  type: 'spelling' | 'grammar' | 'punctuation';
  location: 'title' | 'description' | 'image_text';
  original: string;
  suggestion: string;
  line?: number;
  column?: number;
}

export interface SpellCheckResult {
  hasIssues: boolean;
  issues: SpellCheckIssue[];
  overallQuality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  summary: string;
  confidence: number;
}

export async function performSpellCheck(
  title: string,
  description: string,
  imageText: string
): Promise<SpellCheckResult> {
  try {
    console.log('开始使用GPT-4o进行拼写检查...');
    
    const combinedText = `
产品标题: ${title}
产品描述: ${description}
图片文字: ${imageText}
    `.trim();

    const promptText = `
请仔细分析以下产品信息，检查是否存在拼写错误、语法错误或其他明显问题。
支持英文、法文、德文等多种语言的检查。

${combinedText}

请按以下JSON格式返回分析结果：
{
  "hasIssues": true/false,
  "issues": [
    {
      "type": "spelling/grammar/punctuation",
      "location": "title/description/image_text",
      "original": "原始内容",
      "suggestion": "建议修改",
      "line": 行号,
      "column": 列号
    }
  ],
  "overallQuality": "excellent/good/needs_improvement/poor",
  "summary": "总体评价",
  "confidence": 0.95
}

只返回JSON格式，不要其他内容。
`;

    const resultText = await callGpt4oWithText(promptText);
    const result = JSON.parse(resultText) as SpellCheckResult;

    console.log('GPT-4o拼写检查完成，发现问题数量:', result.issues.length);
    return result;

  } catch (error) {
    console.error('GPT-4o拼写检查失败:', error);
    return {
      hasIssues: false,
      issues: [],
      overallQuality: 'good',
      summary: '分析过程中出现错误',
      confidence: 0,
    };
  }
} 