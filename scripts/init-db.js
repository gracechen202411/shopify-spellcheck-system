const { PrismaClient } = require('@prisma/client');

async function initDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 开始初始化数据库...');
    
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 创建表（如果不存在）
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "product_checks" (
        "id" SERIAL PRIMARY KEY,
        "shopifyId" TEXT UNIQUE NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "hasIssues" BOOLEAN NOT NULL,
        "issueCount" INTEGER DEFAULT 0,
        "quality" TEXT NOT NULL,
        "issues" TEXT NOT NULL,
        "ocrText" TEXT,
        "summary" TEXT,
        "notified" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('✅ 数据库表创建成功');
    
    // 测试插入一条记录
    const testRecord = await prisma.productCheck.create({
      data: {
        shopifyId: 'test-init-' + Date.now(),
        title: '数据库初始化测试',
        hasIssues: false,
        quality: 'good',
        issues: JSON.stringify([]),
        summary: '数据库初始化成功'
      }
    });
    
    console.log('✅ 测试记录创建成功:', testRecord.id);
    
    // 查询记录数量
    const count = await prisma.productCheck.count();
    console.log('📊 当前记录数量:', count);
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase(); 