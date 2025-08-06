// 只保留OpenRouter相关的函数，移除OCR代码

export async function callGpt4oWithText(promptText: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const referer = process.env.OPENROUTER_REFERER?.trim() || "";
  const siteTitle = process.env.OPENROUTER_TITLE?.trim() || "";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in environment variables");
  }

  // 确保API Key只包含ASCII字符
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
    console.error('Invalid API Key format. API Key should only contain ASCII characters.');
    throw new Error("Invalid OPENROUTER_API_KEY format. Please check for non-ASCII characters.");
  }

  try {
    // 构建请求头，确保所有值都是ASCII字符
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // 只有当referer和siteTitle是ASCII字符时才添加
    if (referer && /^[\x00-\x7F]*$/.test(referer)) {
      headers["HTTP-Referer"] = referer;
    }
    
    if (siteTitle && /^[\x00-\x7F]*$/.test(siteTitle)) {
      headers["X-Title"] = siteTitle;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error('Failed to call OpenRouter API:', error);
    throw error;
  }
}

// 修复图片处理函数的编码问题
export async function callGpt4oWithImage({
  imageUrl,
  promptText,
}: {
  imageUrl: string;
  promptText: string;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const referer = process.env.OPENROUTER_REFERER?.trim() || "";
  const siteTitle = process.env.OPENROUTER_TITLE?.trim() || "";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in environment variables");
  }

  // 确保API Key只包含ASCII字符
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
    console.error('Invalid API Key format. API Key should only contain ASCII characters.');
    throw new Error("Invalid OPENROUTER_API_KEY format. Please check for non-ASCII characters.");
  }

  console.log('API Key validation passed, making request to OpenRouter...');

  try {
    // 构建请求头，确保所有值都是ASCII字符
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // 只有当referer和siteTitle是ASCII字符时才添加
    if (referer && /^[\x00-\x7F]*$/.test(referer)) {
      headers["HTTP-Referer"] = referer;
    }
    
    if (siteTitle && /^[\x00-\x7F]*$/.test(siteTitle)) {
      headers["X-Title"] = siteTitle;
    }

    console.log('Request headers:', Object.keys(headers));

    // 确保imageUrl是有效的URL格式
    const encodedImageUrl = encodeURI(imageUrl);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
              {
                type: "image_url",
                image_url: {
                  url: encodedImageUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('OpenRouter API Response received successfully');

    return result.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error('Failed to call OpenRouter API:', error);
    throw error;
  }
}