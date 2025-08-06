import { useState, useEffect } from 'react';
import { NextPage } from 'next';

interface CheckResult {
  id: string;
  shopifyId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  hasIssues: boolean;
  issueCount: number;
  quality: string;
  issues: any[];
  ocrText?: string;
  summary?: string;
  notified: boolean;
}

const Dashboard: NextPage = () => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'issues' | 'no-issues'>('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/dashboard/results');
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (filter === 'issues') return result.hasIssues;
    if (filter === 'no-issues') return !result.hasIssues;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'needs_improvement': return 'orange';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              border: '2px solid #2563eb', 
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Shopify 产品检查记录
          </h1>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: filter === 'all' ? '#2563eb' : '#ffffff',
                color: filter === 'all' ? '#ffffff' : '#374151',
                border: filter !== 'all' ? '1px solid #d1d5db' : 'none'
              }}
            >
              全部 ({results.length})
            </button>
            <button
              onClick={() => setFilter('issues')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: filter === 'issues' ? '#dc2626' : '#ffffff',
                color: filter === 'issues' ? '#ffffff' : '#374151',
                border: filter !== 'issues' ? '1px solid #d1d5db' : 'none'
              }}
            >
              有问题 ({results.filter(r => r.hasIssues).length})
            </button>
            <button
              onClick={() => setFilter('no-issues')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: filter === 'no-issues' ? '#16a34a' : '#ffffff',
                color: filter === 'no-issues' ? '#ffffff' : '#374151',
                border: filter !== 'no-issues' ? '1px solid #d1d5db' : 'none'
              }}
            >
              无问题 ({results.filter(r => !r.hasIssues).length})
            </button>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>暂无检查记录</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filteredResults.map((result) => (
              <div key={result.id} style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '0.5rem', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                padding: '1.5rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      {result.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      Shopify ID: {result.shopifyId}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      检查时间: {formatDate(result.createdAt)}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: result.hasIssues ? '#fef2f2' : '#f0fdf4',
                      color: result.hasIssues ? '#dc2626' : '#16a34a'
                    }}>
                      {result.hasIssues ? '有问题' : '无问题'}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: getQualityColor(result.quality)
                    }}>
                      {result.quality}
                    </span>
                  </div>
                </div>

                {result.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>产品描述</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {result.description}
                    </p>
                  </div>
                )}

                {result.ocrText && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>OCR 提取文字</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.25rem' }}>
                      {result.ocrText.substring(0, 200)}
                      {result.ocrText.length > 200 && '...'}
                    </p>
                  </div>
                )}

                {result.hasIssues && result.issues.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                      发现问题 ({result.issueCount} 个)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {result.issues.map((issue, index) => (
                        <div key={index} style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.25rem' }}>
                          <p style={{ fontSize: '0.875rem' }}>
                            <span style={{ fontWeight: '500' }}>{issue.type}</span> 
                            ({issue.location}): 
                            <span style={{ color: '#dc2626' }}>"{issue.original}"</span> 
                            → 
                            <span style={{ color: '#16a34a' }}>"{issue.suggestion}"</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.summary && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>检查总结</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{result.summary}</p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span>问题数量: {result.issueCount}</span>
                    <span>通知状态: {result.notified ? '已通知' : '未通知'}</span>
                  </div>
                  
                  {result.imageUrl && (
                    <a 
                      href={result.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}
                    >
                      查看图片
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 