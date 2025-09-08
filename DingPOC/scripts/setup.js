#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始设置钉钉-Apollo POC项目...\n');

// 创建必要的目录
const directories = ['data', 'logs', 'config'];
directories.forEach(dir => {
  const dirPath = path.resolve(__dirname, `../${dir}`);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ 创建目录: ${dir}/`);
  } else {
    console.log(`📁 目录已存在: ${dir}/`);
  }
});

// 检查环境变量文件
const envPath = path.resolve(__dirname, '../.env');
const envExamplePath = path.resolve(__dirname, '../.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ 创建环境变量文件: .env');
  console.log('   请检查并更新 .env 文件中的配置信息');
} else {
  console.log('📝 环境变量文件已存在');
}

console.log('\n📦 安装依赖包...');

// 安装根目录依赖
try {
  console.log('🔧 安装根目录依赖...');
  execSync('npm install', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch (error) {
  console.error('❌ 根目录依赖安装失败:', error.message);
}

// 安装后端依赖
try {
  console.log('🔧 安装后端依赖...');
  const backendPath = path.resolve(__dirname, '../backend');
  execSync('npm install', { stdio: 'inherit', cwd: backendPath });
} catch (error) {
  console.error('❌ 后端依赖安装失败:', error.message);
}

// 检查前端目录并创建React应用（如果不存在）
const frontendPath = path.resolve(__dirname, '../frontend');
if (!fs.existsSync(path.join(frontendPath, 'src'))) {
  console.log('🔧 创建React前端应用...');
  try {
    // 如果frontend目录存在但没有src，先清空
    if (fs.existsSync(frontendPath)) {
      const files = fs.readdirSync(frontendPath);
      files.forEach(file => {
        if (file !== 'package.json') {
          const filePath = path.join(frontendPath, file);
          if (fs.lstatSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      });
    }
    
    // 使用create-react-app创建应用
    execSync('npx create-react-app . --template typescript', { 
      stdio: 'inherit', 
      cwd: frontendPath 
    });
    
    // 安装额外的依赖
    execSync('npm install antd axios @ant-design/icons moment', { 
      stdio: 'inherit', 
      cwd: frontendPath 
    });
    
  } catch (error) {
    console.error('❌ 前端应用创建失败:', error.message);
    console.log('请手动运行: cd frontend && npx create-react-app . --template typescript');
  }
} else {
  console.log('🔧 安装前端依赖...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: frontendPath });
  } catch (error) {
    console.error('❌ 前端依赖安装失败:', error.message);
  }
}

console.log('\n🎯 设置完成！\n');

// 显示使用指南
console.log('📋 使用指南:');
console.log('1. 检查 .env 文件中的钉钉API配置');
console.log('2. 启动后端服务: npm run dev:backend');
console.log('3. 启动前端服务: npm run dev:frontend');
console.log('4. 或同时启动: npm run dev:all');
console.log('5. 运行健康检查: npm run health');
console.log('');
console.log('🌐 访问地址:');
console.log('   前端界面: http://localhost:3000');
console.log('   后端API: http://localhost:8000/health');
console.log('');
console.log('🎉 POC项目设置完成，祝您使用愉快！');