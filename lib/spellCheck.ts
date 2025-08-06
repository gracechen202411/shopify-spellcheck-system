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

export async function performSpellCheck(title: string, body_html: string, ocr_text: string) {
  const prompt = `
你是一位专业的电商内容审核专家，擅长多语言环境下的产品信息检查（支持英文、法文、德文）。
请你阅读并理解以下 Shopify 产品内容，自动识别其中的语言，并判断是否存在拼写、语法、用词或格式等方面的问题。

🧠 请深入理解内容的含义，确保表达自然、准确、专业。
🌐 内容可能为英文、法文、德文，或它们的混合，请你自动识别语言并合理判断表达是否正确。

🔍【检查范围】
1. 产品标题（title）
2. 产品描述（body_html）
3. 图片文字识别结果（ocr_text）

📝【输出格式】
- 只返回**标准JSON**，不要输出任何解释、说明、代码块标记或多余内容。
- JSON结构如下：
{
  "hasIssues": true/false,
  "issues": [
    {
      "type": "拼写/语法/用词/格式",
      "original": "原文片段",
      "suggestion": "建议修改",
      "explanation": "中文说明"
    }
  ],
  "overallQuality": "整体质量评价",
  "summary": "简要总结",
  "confidence": 0-1
}
- 如果所有内容都没有明显问题，返回：
{
  "hasIssues": false,
  "issues": [],
  "overallQuality": "good",
  "summary": "无明显错误 / No major issues found.",
  "confidence": 1
}

📦【待审核内容】

产品标题（Product Title）：
${title}

产品描述（Product Description）：
${body_html}

图片文字（OCR Text from Image）：
${ocr_text}
`;

  // 调用AI接口
  const aiResponse = await callGpt4oWithText(prompt);

  // 自动清洗AI返回内容，去除代码块标记和多余空行
  let clean = aiResponse.trim();
  clean = clean.replace(/^```json|^```|```$/gm, '').trim();

  let result;
  try {
    result = JSON.parse(clean);
  } catch (e) {
    // 兜底：返回一个默认对象，并记录原始内容
    result = {
      hasIssues: false,
      issues: [],
      overallQuality: 'unknown',
      summary: 'AI返回非JSON: ' + clean,
      confidence: 0
    };
  }
  return result;
} 