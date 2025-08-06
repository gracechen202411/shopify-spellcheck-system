import { NextApiRequest, NextApiResponse } from 'next';
import { getCheckResults } from '../../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const results = await getCheckResults(limit);

    res.status(200).json({
      success: true,
      results,
      total: results.length
    });
  } catch (error) {
    console.error('获取检查结果失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 