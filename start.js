/**
 * Simple backend startup script for إتجاه العقارية (Etjahh Real Estate)
 * نص بدء تشغيل بسيط للواجهة الخلفية لشركة إتجاه العقارية
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🏢 Starting إتجاه العقارية Backend Server...');
console.log('🚀 بدء تشغيل خادم شركة إتجاه العقارية...');

// Start the TypeScript server
const server = spawn('npx', ['ts-node', './src/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Server startup error:', error);
  console.error('❌ خطأ في بدء تشغيل الخادم:', error.message);
});

server.on('close', (code) => {
  console.log(`🔴 Server process exited with code ${code}`);
  console.log(`🔴 انتهت عملية الخادم برمز ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  console.log('\n🛑 إيقاف الخادم بأمان...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  console.log('\n🛑 تم استلام إشارة الإنهاء، جاري الإيقاف...');
  server.kill('SIGTERM');
  process.exit(0);
});
