const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ path: '../.env' });

const dingTalkService = require('./services/dingtalk');
const databaseService = require('./services/database');
const apolloService = require('./services/apollo');

const app = express();
const port = process.env.BACKEND_PORT || 8000;

// 中间件
app.use(helmet());
// 允許從本地靜態頁面(file://)與各本地端口請求（僅開發用）
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// 性能监控中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    if (duration > 5000) {
      console.warn(`⚠️ 慢查询警告: ${req.path} 耗时 ${duration}ms`);
    }
  });
  
  next();
});

// 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'dingtalk-apollo-poc-backend'
  });
});

// 手动触发数据同步
app.post('/api/sync-employees', async (req, res) => {
  try {
    console.log('🚀 开始员工数据同步...');
    
    // 从请求体获取钉钉API配置
    const { corpId, clientId, clientSecret } = req.body;
    
    if (!corpId || !clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的钉钉认证信息: corpId, clientId, clientSecret',
        error: 'Missing required parameters'
      });
    }
    
    // 更新钉钉服务配置
    dingTalkService.updateCredentials(corpId, clientId, clientSecret);
    
    // 1. 调用钉钉API获取数据
    const [activeEmployees, pendingEmployees, departedEmployees] = await Promise.all([
      dingTalkService.getActiveEmployees(),
      dingTalkService.getPendingEmployees(), 
      dingTalkService.getDepartedEmployees()
    ]);

    console.log('📊 钉钉API数据获取完成:', {
      active: activeEmployees.length,
      pending: pendingEmployees.length,
      departed: departedEmployees.length
    });

    // 2. ETL数据处理
    const processedData = [
      ...activeEmployees.map(emp => ({ ...emp, status: '在职' })),
      ...pendingEmployees.map(emp => ({ ...emp, status: '待入职' })),
      ...departedEmployees.map(emp => ({ ...emp, status: '离职' }))
    ];

    // 3. 保存到本地数据库
    await databaseService.saveEmployees(processedData);

    // 4. 导入到Apollo系统
    const apolloResult = await apolloService.importEmployees(processedData);

    console.log('✅ 数据同步完成');
    
    res.json({
      success: true,
      message: '员工数据同步成功',
      data: {
        totalProcessed: processedData.length,
        breakdown: {
          active: activeEmployees.length,
          pending: pendingEmployees.length,
          departed: departedEmployees.length
        },
        apolloImport: apolloResult,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    res.status(500).json({
      success: false,
      message: '数据同步失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 获取员工数据
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await databaseService.getEmployees();
    res.json({
      success: true,
      data: employees,
      total: employees.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 获取员工数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取员工数据失败',
      error: error.message
    });
  }
});

// 获取同步日志
app.get('/api/sync-logs', async (req, res) => {
  try {
    const logs = await databaseService.getSyncLogs();
    res.json({
      success: true,
      data: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 获取同步日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取同步日志失败',
      error: error.message
    });
  }
});

// 清空员工数据（用于测试）
app.delete('/api/employees', async (req, res) => {
  try {
    console.log('🗑️ 开始清空员工数据...');
    const result = await databaseService.clearEmployees();
    
    res.json({
      success: true,
      message: '员工数据已清空',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 清空员工数据失败:', error);
    res.status(500).json({
      success: false,
      message: '清空员工数据失败',
      error: error.message
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('💥 未处理的错误:', error);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 后端服务启动成功: http://localhost:${port}`);
  console.log(`📋 健康检查: http://localhost:${port}/health`);
  
  // 初始化数据库
  databaseService.initDatabase().then(() => {
    console.log('✅ 数据库初始化完成');
  }).catch(error => {
    console.error('❌ 数据库初始化失败:', error);
  });
});

module.exports = app;
