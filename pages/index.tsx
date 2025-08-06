import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Shopify 多语言产品审核系统</title>
        <meta name="description" content="智能监控Shopify产品，自动检查拼写错误" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shopify 多语言产品审核系统
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            智能监控新上架商品，自动进行OCR文字识别和多语言拼写检查，
            发现问题及时通知，确保产品质量。
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 工作流测试 */}
          <Link href="/workflow-test">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                工作流测试
              </h3>
              <p className="text-gray-600">
                测试完整的OCR和拼写检查流程，输入图片URL查看详细结果
              </p>
            </div>
          </Link>

          {/* OCR测试 */}
          <Link href="/ocr-test">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                OCR测试
              </h3>
              <p className="text-gray-600">
                单独测试OCR功能，支持多种引擎，实时显示识别进度
              </p>
            </div>
          </Link>

          {/* 仪表板 */}
          <Link href="/dashboard">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                检查记录
              </h3>
              <p className="text-gray-600">
                查看所有产品检查记录，按问题状态筛选，显示详细结果
              </p>
            </div>
          </Link>
        </div>

        {/* 系统特性 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            系统特性
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-semibold text-gray-900 mb-2">智能OCR</h4>
              <p className="text-sm text-gray-600">
                支持ChatGPT-4o、Google Vision、Tesseract多种引擎
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-semibold text-gray-900 mb-2">多语言支持</h4>
              <p className="text-sm text-gray-600">
                支持英文、法文、德文等多种语言的拼写检查
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔔</div>
              <h4 className="font-semibold text-gray-900 mb-2">智能通知</h4>
              <p className="text-sm text-gray-600">
                发现问题自动发送飞书通知，及时提醒
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-semibold text-gray-900 mb-2">数据分析</h4>
              <p className="text-sm text-gray-600">
                提供详细的分析报告和质量评估
              </p>
            </div>
          </div>
        </div>

        {/* 快速开始 */}
        <div className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            快速开始
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">配置环境变量</h4>
                  <p className="text-sm text-gray-600">
                    设置 OpenRouter API Key 和飞书 Webhook URL
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">测试OCR功能</h4>
                  <p className="text-sm text-gray-600">
                    访问 OCR测试页面，上传图片测试识别效果
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">测试完整流程</h4>
                  <p className="text-sm text-gray-600">
                    访问工作流测试页面，测试完整的OCR和拼写检查流程
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">查看检查记录</h4>
                  <p className="text-sm text-gray-600">
                    访问仪表板页面，查看所有检查记录和统计信息
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 技术栈 */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">技术栈</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              Next.js 14
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              Prisma
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              ChatGPT-4o
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 