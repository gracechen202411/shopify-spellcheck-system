'use client';

import { useState, useRef } from 'react';

interface UploaderProps {
  onProcess: (imageUrl: string) => Promise<void>;
  isProcessing: boolean;
}

export default function Uploader({ onProcess, isProcessing }: UploaderProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setImageUrl(url);
    }
  };

  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
    setUploadedImage(null);
  };

  const handleProcess = () => {
    if (imageUrl.trim()) {
      onProcess(imageUrl);
    }
  };

  const handleClear = () => {
    setImageUrl('');
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          图片上传
        </h2>
        
        {/* 文件上传 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择本地图片
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* URL输入 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            或输入图片URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlInput}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 图片预览 */}
        {(uploadedImage || imageUrl) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片预览
            </label>
            <div className="border border-gray-300 rounded-md p-2">
              <img
                src={uploadedImage || imageUrl}
                alt="预览"
                className="max-w-full h-auto max-h-64 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={handleProcess}
            disabled={!imageUrl.trim() || isProcessing}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
            ) : (
              '识别 + 检查拼写'
            )}
          </button>
          
          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  );
} 