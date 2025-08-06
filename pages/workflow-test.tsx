import { useState } from 'react';
import Head from 'next/head';

interface WorkflowResult {
  success: boolean;
  message: string;
  data?: {
    product: {
      id: string;
      title: string;
      imageUrl: string;
    };
    ocr: {
      provider: string;
      text: string;
      textLength: number;
    };
    spellCheck: {
      hasIssues: boolean;
      issuesCount: number;
      overallQuality: string;
      confidence: number;
      issues: any[];
      summary: string;
    };
    workflow: {
      ocrCompleted: boolean;
      spellCheckCompleted: boolean;
      notificationSent: boolean;
      databaseSaved: boolean;
    };
  };
}

export default function WorkflowTest() {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);

  const testWorkflow = async () => {
    if (!imageUrl) {
      alert('请输入图片URL');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          title,
          bodyHtml,
        }),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Head>
        <title>工作流测试</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Shopify产品监控工作流测试</h1>

        {/* 输入表单 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试参数</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片URL *
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                产品标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="产品标题"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                产品描述
              </label>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="产品描述HTML内容"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={testWorkflow}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
            >
              {isProcessing ? '🔄 处理中...' : '🚀 开始测试完整工作流'}
            </button>
          </div>
        </div>

        {/* 处理状态 */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600 mb-2">正在处理完整工作流...</div>
            <div className="text-sm text-gray-500">
              步骤1: OCR文字识别 → 步骤2: 拼写检查 → 步骤3: 飞书通知 → 步骤4: 数据库保存
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ 工作流测试成功' : '❌ 工作流测试失败'}
            </h2>
            
            {result.success && result.data && (
              <div className="space-y-6">
                {/* 产品信息 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-600 mb-2">📦 产品信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {result.data.product.id}
                    </div>
                    <div>
                      <span className="font-medium">标题:</span> {result.data.product.title}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">图片:</span> {result.data.product.imageUrl}
                    </div>
                  </div>
                </div>

                {/* OCR结果 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-green-600 mb-2">🔍 OCR识别结果</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">引擎:</span> {result.data.ocr.provider}
                    </div>
                    <div>
                      <span className="font-medium">字符数:</span> {result.data.ocr.textLength}
                    </div>
                    <div>
                      <span className="font-medium">状态:</span> 
                      <span className="text-green-600">✅ 完成</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {result.data.ocr.text || '未识别到文字'}
                  </div>
                </div>

                {/* 拼写检查结果 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-purple-600 mb-2">📝 拼写检查结果</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">发现问题:</span> 
                      <span className={result.data.spellCheck.hasIssues ? 'text-red-600' : 'text-green-600'}>
                        {result.data.spellCheck.hasIssues ? '❌ 是' : '✅ 否'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">问题数量:</span> {result.data.spellCheck.issuesCount}
                    </div>
                    <div>
                      <span className="font-medium">质量评级:</span> {result.data.spellCheck.overallQuality}
                    </div>
                    <div>
                      <span className="font-medium">置信度:</span> {result.data.spellCheck.confidence}
                    </div>
                  </div>
                  {result.data.spellCheck.issues.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded text-sm">
                      <div className="font-medium mb-2">发现的问题:</div>
                      {result.data.spellCheck.issues.map((issue, index) => (
                        <div key={index} className="mb-2 p-2 bg-white rounded border">
                          <div><strong>类型:</strong> {issue.type}</div>
                          <div><strong>位置:</strong> {issue.location}</div>
                          <div><strong>原文:</strong> {issue.original}</div>
                          <div><strong>建议:</strong> {issue.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>总结:</strong> {result.data.spellCheck.summary}
                  </div>
                </div>

                {/* 工作流状态 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-orange-600 mb-2">⚙️ 工作流状态</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">OCR完成:</span> 
                      <span className={result.data.workflow.ocrCompleted ? 'text-green-600' : 'text-red-600'}>
                        {result.data.workflow.ocrCompleted ? '✅' : '❌'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">拼写检查:</span> 
                      <span className={result.data.workflow.spellCheckCompleted ? 'text-green-600' : 'text-red-600'}>
                        {result.data.workflow.spellCheckCompleted ? '✅' : '❌'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">通知发送:</span> 
                      <span className={result.data.workflow.notificationSent ? 'text-green-600' : 'text-gray-400'}>
                        {result.data.workflow.notificationSent ? '✅' : '⏭️'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">数据库保存:</span> 
                      <span className={result.data.workflow.databaseSaved ? 'text-green-600' : 'text-red-600'}>
                        {result.data.workflow.databaseSaved ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!result.success && (
              <div className="text-red-600">
                <div className="font-semibold">错误信息:</div>
                <div className="mt-2 p-3 bg-red-50 rounded">{result.message}</div>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用说明:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 输入图片URL进行完整的OCR和拼写检查测试</li>
            <li>• 系统会使用ChatGPT-4o进行智能OCR识别</li>
            <li>• 自动进行多语言拼写和语法检查</li>
            <li>• 如果发现问题会自动发送飞书通知</li>
            <li>• 所有结果都会保存到数据库</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 