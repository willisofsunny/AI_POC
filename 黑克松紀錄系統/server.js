const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '黑克松資料.json');

// 中間件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.')); // 服務當前目錄的靜態文件

// 日誌中間件
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        dataFile: DATA_FILE,
        uptime: process.uptime()
    });
});

// API 端點：讀取資料
app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);
        
        console.log(`✓ 成功讀取資料，共 ${jsonData.prompts?.length || 0} 筆記錄`);
        res.json(jsonData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // 文件不存在，創建預設資料
            const defaultData = {
                prompts: [
                    {
                        id: "1",
                        scenario: "生成一個 Tailwind CSS 按鈕",
                        contributor: "AI助手",
                        prompt: "請幫我生成一個使用 Tailwind CSS 的按鈕元件，包含 hover 效果和不同的顏色變體。",
                        notes: "使用 Tailwind CSS 的 utility classes 來快速構建按鈕樣式。",
                        createdAt: new Date().toISOString()
                    }
                ],
                lastUpdated: new Date().toISOString()
            };
            
            try {
                await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
                console.log('✓ 創建預設資料文件');
                res.json(defaultData);
            } catch (writeError) {
                console.error('✗ 創建預設資料文件失敗:', writeError);
                res.status(500).json({ 
                    error: '無法創建預設資料文件',
                    details: writeError.message 
                });
            }
        } else {
            console.error('✗ 讀取資料失敗:', error);
            res.status(500).json({ 
                error: '讀取資料失敗',
                details: error.message 
            });
        }
    }
});

// API 端點：保存資料
app.post('/api/save', async (req, res) => {
    try {
        const data = req.body;
        
        // 驗證資料格式
        if (!data || !Array.isArray(data.prompts)) {
            return res.status(400).json({ 
                error: '無效的資料格式',
                message: '資料必須包含 prompts 陣列' 
            });
        }

        // 更新最後修改時間
        data.lastUpdated = new Date().toISOString();
        
        // 寫入文件
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`✓ 成功保存資料，共 ${data.prompts.length} 筆記錄`);
        res.json({ 
            success: true, 
            message: '資料保存成功',
            recordCount: data.prompts.length,
            timestamp: data.lastUpdated
        });
    } catch (error) {
        console.error('✗ 保存資料失敗:', error);
        res.status(500).json({ 
            error: '保存資料失敗',
            details: error.message 
        });
    }
});

// API 端點：備份資料
app.post('/api/backup', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(__dirname, `備份_${timestamp}.json`);
        
        const data = await fs.readFile(DATA_FILE, 'utf8');
        await fs.writeFile(backupFile, data, 'utf8');
        
        console.log(`✓ 成功創建備份文件: ${backupFile}`);
        res.json({ 
            success: true, 
            message: '備份創建成功',
            backupFile: path.basename(backupFile)
        });
    } catch (error) {
        console.error('✗ 創建備份失敗:', error);
        res.status(500).json({ 
            error: '創建備份失敗',
            details: error.message 
        });
    }
});

// API 端點：恢復備份
app.post('/api/restore', async (req, res) => {
    try {
        const { backupFile } = req.body;
        
        if (!backupFile) {
            return res.status(400).json({ 
                error: '缺少備份文件名',
                message: '請提供要恢復的備份文件名' 
            });
        }
        
        const backupPath = path.join(__dirname, backupFile);
        const data = await fs.readFile(backupPath, 'utf8');
        
        // 驗證備份資料格式
        const jsonData = JSON.parse(data);
        if (!jsonData.prompts || !Array.isArray(jsonData.prompts)) {
            throw new Error('備份文件格式無效');
        }
        
        // 恢復資料
        await fs.writeFile(DATA_FILE, data, 'utf8');
        
        console.log(`✓ 成功從備份恢復資料: ${backupFile}`);
        res.json({ 
            success: true, 
            message: '備份恢復成功',
            backupFile: backupFile,
            recordCount: jsonData.prompts.length
        });
    } catch (error) {
        console.error('✗ 恢復備份失敗:', error);
        res.status(500).json({ 
            error: '恢復備份失敗',
            details: error.message 
        });
    }
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
    console.error('服務器錯誤:', error);
    res.status(500).json({ 
        error: '內部服務器錯誤',
        message: error.message 
    });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: '端點不存在',
        message: `找不到路徑: ${req.originalUrl}`,
        availableEndpoints: [
            'GET /health',
            'GET /api/data',
            'POST /api/save',
            'POST /api/backup',
            'POST /api/restore'
        ]
    });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log('🚀 黑克松紀錄系統服務器已啟動');
    console.log(`📍 服務地址: http://localhost:${PORT}`);
    console.log(`📁 資料文件: ${DATA_FILE}`);
    console.log(`⏰ 啟動時間: ${new Date().toISOString()}`);
    console.log('💡 按 Ctrl+C 停止服務器');
});

// 優雅關閉
process.on('SIGINT', async () => {
    console.log('\n🛑 正在關閉服務器...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 正在關閉服務器...');
    process.exit(0);
});
