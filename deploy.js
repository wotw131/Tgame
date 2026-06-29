/**
 * 鸦岭 Crow Ridge — 一键部署脚本
 * 使用 localtunnel 创建公网隧道，免注册
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8899;

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Simple static file server
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404</h1><p>页面不存在 · 回头看看线索？</p>');
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  🕯️  鸦岭 · Crow Ridge`);
  console.log(`  📡 本地服务: http://localhost:${PORT}`);
  console.log(`  🌐 正在创建公网隧道...\n`);

  // Use localtunnel npm package to create public URL
  const localtunnel = require('localtunnel');

  (async () => {
    try {
      const tunnel = await localtunnel({ port: PORT });
      console.log(`  ✅ 公网链接已生成！\n`);
      console.log(`  ╔══════════════════════════════════════╗`);
      console.log(`  ║  🎮 游戏公网地址:                    ║`);
      console.log(`  ║  ${tunnel.url}          ║`);
      console.log(`  ║                                      ║`);
      console.log(`  ║  将此链接分享给朋友即可在线游玩      ║`);
      console.log(`  ║  按 Ctrl+C 停止服务器                ║`);
      console.log(`  ╚══════════════════════════════════════╝\n`);

      tunnel.on('close', () => {
        console.log('\n  ⚠️  隧道已关闭\n');
      });
    } catch (e) {
      console.log(`  ❌ 隧道创建失败: ${e.message}`);
      console.log(`  📡 本地地址: http://localhost:${PORT}\n`);
      console.log(`  请尝试手动部署:\n`);
      console.log(`  • GitHub Pages: 将项目推送到 GitHub 仓库并开启 Pages`);
      console.log(`  • Netlify: 在 app.netlify.com 拖拽整个文件夹`);
      console.log(`  • Vercel: 使用 vercel CLI 或网页端导入`);
      console.log(`  • surge.sh: npx surge . your-domain.surge.sh\n`);
    }
  })();
});
