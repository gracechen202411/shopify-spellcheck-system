// 调试结果类型定义
export interface DebugResult {
  loading?: boolean;
  error?: string;
  ocrText?: string;
  spellCheckResult?: {
    overallQuality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    summary: string;
    hasIssues: boolean;
    issues: Array<{
      type: 'spelling' | 'grammar' | 'other';
      location: string;
      original: string;
      suggestion: string;
    }>;
  };
}

// OCR 结果类型
export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  provider: string;
}

// 工作流结果类型
export interface WorkflowResult {
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