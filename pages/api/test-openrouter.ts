import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'OPENROUTER_API_KEY not found in environment variables',
        debug: {
          hasApiKey: false,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 检查API Key格式
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(apiKey);
    
    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API Key format. Contains non-ASCII characters.',
        debug: {
          hasApiKey: true,
          keyLength: apiKey.length,
          firstChar: apiKey.charCodeAt(0),
          invalidCharFound: true,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 测试API连接
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const isApiWorking = response.ok;
      const statusCode = response.status;

      return res.status(200).json({
        success: true,
        message: 'API Key validation completed',
        debug: {
          hasApiKey: true,
          keyLength: apiKey.length,
          keyFormat: 'valid',
          apiConnection: isApiWorking ? 'success' : 'failed',
          apiStatusCode: statusCode,
          timestamp: new Date().toISOString()
        }
      });

    } catch (apiError) {
      return res.status(200).json({
        success: false,
        error: 'Failed to test API connection',
        debug: {
          hasApiKey: true,
          keyLength: apiKey.length,
          keyFormat: 'valid',
          apiConnection: 'error',
          apiError: apiError instanceof Error ? apiError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        timestamp: new Date().toISOString()
      }
    });
  }
} 