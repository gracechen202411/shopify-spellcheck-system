import { useState } from 'react';
import Head from 'next/head';

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  provider: string;
}

interface DebugInfo {
  textLength: number;
  hasCredentials: boolean;
  timestamp: string;
}

export default function OCRTest() {
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    'google-vision'?: { success: boolean; data?: OCRResult; error?: string; debug?: DebugInfo };
    'tesseract'?: { success: boolean; data?: OCRResult; error?: string; debug?: DebugInfo };
    'chatgpt-4o'?: { success: boolean; data?: OCRResult; error?: string; debug?: DebugInfo };
  }>({});

  const testOCR = async (provider: 'google-vision' | 'tesseract' | 'chatgpt-4o') => {
    if (!imageUrl) {
      alert('请输入图片URL');
      return;
    }

    setIsProcessing(true);
    setResults(prev => ({ ...prev, [provider]: undefined }));

    try {
      const response = await fetch(`/api/ocr/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();
      setResults(prev => ({ ...prev, [provider]: result }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [provider]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const testAll = async () => {
    if (!imageUrl) {
      alert('请输入图片URL');
      return;
    }

    setIsProcessing(true);
    setResults({});

    // 并行测试所有OCR引擎
    const providers: ('google-vision' | 'tesseract' | 'chatgpt-4o')[] = ['google-vision', 'tesseract', 'chatgpt-4o'];
    
    const promises = providers.map(async (provider) => {
      try {
        const response = await fetch(`/api/ocr/${provider}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        const result = await response.json();
        return { provider, result };
      } catch (error) {
        return {
          provider,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    });

    const results = await Promise.all(promises);
    const newResults: any = {};
    results.forEach(({ provider, result }) => {
      newResults[provider] = result;
    });

    setResults(newResults);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Head>
        <title>OCR测试工具</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">OCR识别结果对比</h1>

        {/* 图片显示区域 */}
        {imageUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">测试图片</h2>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="测试图片"
                className="max-w-full max-h-96 object-contain border rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  alert('图片加载失败，请检查URL是否正确');
                }}
              />
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="请输入图片URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={testAll}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isProcessing ? '处理中...' : '对比测试'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => testOCR('google-vision')}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              Google Vision
            </button>
            <button
              onClick={() => testOCR('tesseract')}
              disabled={isProcessing}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              Tesseract
            </button>
            <button
              onClick={() => testOCR('chatgpt-4o')}
              disabled={isProcessing}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              ChatGPT-4o
            </button>
          </div>
        </div>

        {/* 处理状态 */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="text-lg text-gray-600">正在处理中,请稍候...</div>
          </div>
        )}

        {/* 结果对比区域 */}
        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">识别结果对比:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google Vision 结果 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-green-600 mb-2">google-vision</h3>
                {results['google-vision'] ? (
                  results['google-vision'].success ? (
                    <>
                      <div className="text-green-600 mb-2">
                        ✔ 识别成功 ({results['google-vision'].data?.text.length || 0}字符)
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                        {results['google-vision'].data?.text || '未识别到文字'}
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-500">调试信息</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(results['google-vision'].debug, null, 2)}
                        </pre>
                      </details>
                    </>
                  ) : (
                    <div className="text-red-600">
                      ✗ 识别失败: {results['google-vision'].error}
                    </div>
                  )
                ) : (
                  <div className="text-gray-400">未测试</div>
                )}
              </div>

              {/* Tesseract 结果 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-600 mb-2">tesseract</h3>
                {results['tesseract'] ? (
                  results['tesseract'].success ? (
                    <>
                      <div className="text-green-600 mb-2">
                        ✔ 识别成功 ({results['tesseract'].data?.text.length || 0}字符)
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                        {results['tesseract'].data?.text || '未识别到文字'}
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-500">调试信息</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(results['tesseract'].debug, null, 2)}
                        </pre>
                      </details>
                    </>
                  ) : (
                    <div className="text-red-600">
                      ✗ 识别失败: {results['tesseract'].error}
                    </div>
                  )
                ) : (
                  <div className="text-gray-400">未测试</div>
                )}
              </div>

              {/* ChatGPT-4o 结果 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-600 mb-2">chatgpt-4o</h3>
                {results['chatgpt-4o'] ? (
                  results['chatgpt-4o'].success ? (
                    <>
                      <div className="text-green-600 mb-2">
                        ✔ 识别成功 ({results['chatgpt-4o'].data?.text.length || 0}字符)
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                        {results['chatgpt-4o'].data?.text || '未识别到文字'}
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-500">调试信息</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(results['chatgpt-4o'].debug, null, 2)}
                        </pre>
                      </details>
                    </>
                  ) : (
                    <div className="text-red-600">
                      ✗ 识别失败: {results['chatgpt-4o'].error}
                    </div>
                  )
                ) : (
                  <div className="text-gray-400">未测试</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用说明:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 你可以单独测试Google Vision或Tesseract</li>
            <li>• 也可以选择"对比测试"同时测试三个引擎</li>
            <li>• ChatGPT-4o需要配置OPENROUTER_API_KEY环境变量</li>
            <li>• 建议使用公网可访问的图片URL进行测试</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 