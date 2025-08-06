'use client';

import { DebugResult } from '@/lib/types';

interface ResultViewerProps {
  result: DebugResult | null;
}

export default function ResultViewer({ result }: ResultViewerProps) {
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">��</div>
          <p>上传图片并点击处理按钮开始测试</p>
        </div>
      </div>
    );
  }

  if (result.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在处理中...</p>
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-6xl mb-4">❌</div>
          <p className="font-semibold">处理失败</p>
          <p className="text-sm mt-2">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        处理结果
      </h2>

      {/* OCR提取文本 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          �� OCR提取文本
        </h3>
        <div className="bg-gray-50 rounded-md p-4">
          {result.ocrText ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {result.ocrText}
            </pre>
          ) : (
            <p className="text-gray-500 italic">未提取到文字内容</p>
          )}
        </div>
      </div>

      {/* 拼写检查结果 */}
      {result.spellCheckResult && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            🔍 拼写检查结果
          </h3>
          
          {/* 总体质量 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">总体质量:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                result.spellCheckResult.overallQuality === 'excellent' ? 'bg-green-100 text-green-800' :
                result.spellCheckResult.overallQuality === 'good' ? 'bg-blue-100 text-blue-800' :
                result.spellCheckResult.overallQuality === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {result.spellCheckResult.overallQuality}
              </span>
            </div>
            <p className="text-sm text-gray-600">{result.spellCheckResult.summary}</p>
          </div>

          {/* 问题列表 */}
          {result.spellCheckResult.hasIssues && result.spellCheckResult.issues.length > 0 ? (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">
                发现的问题 ({result.spellCheckResult.issues.length} 个)
              </h4>
              <div className="space-y-3">
                {result.spellCheckResult.issues.map((issue: any, index: number) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            issue.type === 'spelling' ? 'bg-red-100 text-red-800' :
                            issue.type === 'grammar' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {issue.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {issue.location}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-red-600 font-medium">错误:</span>
                          <span className="ml-1">{issue.original}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="text-green-600 font-medium">建议:</span>
                          <span className="ml-1">{issue.suggestion}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="text-green-600 mr-2">✅</div>
                <span className="text-green-800 font-medium">未发现明显问题</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 