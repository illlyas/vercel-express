/* eslint-disable */
import express from 'express';
const server = express();
import path from'path';
import history  from 'connect-history-api-fallback';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, 'dist');
import { createProxyMiddleware } from 'http-proxy-middleware';

server.use('/app/mobile', express.static(distPath));
server.use(history());

const port =  process.env.PORT || 4000;


// 代理开发使用
const proxyTarget = 'https://dev.jiandaoyun.com';
// 本地开发使用
// const proxyTarget = 'http://localhost:3000';

server.use(
  '/',
  createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: true,
    cookieDomainRewrite: '127.0.0.1:' + port,
    ws: true,
    prependPath: false,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      host: 'http://127.0.0.1:' + port
    },
    router: {
      '/socket': 'https://messaging-dev.jiandaoyun.com'
    },
    onProxyRes(proxyRes, req, res) {
      const key = 'set-cookie';
      if (proxyRes.headers[key]) {
        proxyRes.headers[key] = proxyRes.headers[key].map((cookie) => {
          const splitCookie = cookie.split(' ');
          return [splitCookie[0], 'Path=/'].join(' ');
        });
      }
    }
  })
);

server.listen(port, () => {
  console.log('we are now listen at:http://127.0.0.1:' + port);
});

module.export = server;
