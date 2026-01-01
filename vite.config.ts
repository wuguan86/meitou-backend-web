import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0', // 监听所有网络接口，允许外部访问
        // 配置代理，解决开发环境跨域问题
        proxy: {
          '^/api/(app|admin)': {
            target: 'http://localhost:8085', // 后端API地址
            changeOrigin: true, // 改变请求头中的origin
            secure: false, // 如果是https接口，需要配置这个参数
            // 配置代理请求，设置X-Forwarded-Host头
            // 使用configure函数在代理请求发送前修改请求头
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                // 获取原始请求的Host头（包含域名和端口）
                // 这是浏览器发送给Vite的原始Host头
                const originalHost = req.headers.host;
                if (originalHost) {
                  // 将原始Host设置为X-Forwarded-Host，让后端能够获取原始域名
                  proxyReq.setHeader('X-Forwarded-Host', originalHost);
                }
              });
            },
          }
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
