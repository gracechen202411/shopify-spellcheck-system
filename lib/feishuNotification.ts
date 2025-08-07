import axios from 'axios';
import { SpellCheckResult } from './spellCheck';

export interface ProductData {
  id: string;
  title: string;
  body_html: string;
  image_src: string;
  created_at: string;
  shop_domain: string;
}

export async function sendFeishuNotification(
  productData: ProductData,
  spellCheckResult: SpellCheckResult,
  ocrText: string,
  forceNotify: boolean = false
): Promise<boolean> {
  try {
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('FEISHU_WEBHOOK_URL not configured');
      return false;
    }

    // 构建问题列表
    const issuesList = spellCheckResult.issues.length > 0 
      ? spellCheckResult.issues.map((issue, index) => 
          `${index + 1}. **${issue.type}** (${issue.location}): \`${issue.original}\` → \`${issue.suggestion}\``
        ).join('\n')
      : '✅ 未发现拼写或语法问题';

    // 根据是否有问题决定卡片样式
    const hasIssues = spellCheckResult.hasIssues;
    const cardTemplate = hasIssues ? "red" : "green";
    const cardTitle = hasIssues ? "🚨 Shopify产品拼写检查报告" : "✅ Shopify产品检查完成";

    // 构建飞书消息卡片
    const message = {
      msg_type: "interactive",
      card: {
        config: {
          wide_screen_mode: true
        },
        header: {
          title: {
            tag: "plain_text",
            content: cardTitle
          },
          template: cardTemplate
        },
        elements: [
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `**产品标题:** ${productData.title}\n**店铺:** ${productData.shop_domain}`
            }
          },
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `**总体质量:** ${spellCheckResult.overallQuality}\n**发现问题:** ${spellCheckResult.issues.length} 个\n**检查状态:** ${hasIssues ? '发现问题需要处理' : '质量良好无需处理'}`
            }
          },
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `**检查详情:**\n${issuesList}`
            }
          },
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `**OCR提取文字:**\n\`\`\`\n${ocrText.substring(0, 200)}${ocrText.length > 200 ? '...' : ''}\n\`\`\``
            }
          },
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `**检查时间:** ${new Date().toLocaleString('zh-CN')}\n**检查摘要:** ${spellCheckResult.summary || '检查完成'}`
            }
          },
          {
            tag: "action",
            actions: [
              {
                tag: "button",
                text: {
                  tag: "plain_text",
                  content: "查看产品"
                },
                type: hasIssues ? "danger" : "primary",
                url: `https://${productData.shop_domain}/admin/products/${productData.id}`
              }
            ]
          }
        ]
      }
    };

    const response = await axios.post(webhookUrl, message, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log('飞书通知发送成功');
      return true;
    } else {
      console.error('飞书通知发送失败:', response.status, response.data);
      return false;
    }

  } catch (error) {
    console.error('飞书通知发送失败:', error);
    return false;
  }
} 