# 用户管理系统

基于 Vue 3 + TypeScript + Vite + Ant Design Vue 的用户管理系统。

## 技术栈

- 前端框架：Vue 3
- 构建工具：Vite
- UI 组件库: Ant Design Vue
- UI 组件库: Element-Plus-X
- 状态管理：Pinia
- 路由管理：Vue Router
- HTTP 请求：Axios
- 开发语言：TypeScript
- 后端框架：Express
- 数据库：MySQL

## 项目结构

```bash
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── router/          # 路由配置
├── store/           # 状态管理
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
└── views/           # 页面组件
```

## 环境配置
### 开发环境要求
* Node.js >= 18
* pnpm >= 7
* MySql >= 5.7

### 环境变量
在项目根目录创建`.env`文件:
```env
VITE_API_BASE_URL=http://localhost:14258
JWT_SECRET=your_jwt_secret
```

## 项目配置
### TypeScript配置
`tsconfig.json`主要配置:
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Vite 配置
`vite.config.ts`的主要配置:
```ts
{
  plugins: [
    vue(),
    UnoCSS()
  ],
  server: {
    port:8080,
    proxy: {
      '/api': {
        target: "http://localhost:14258",
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    cors: true,
  },
  resolve: {
    alias: {
      '@/views': resolve(__dirname, '.', 'src/views'),
      '@/utils': resolve(__dirname, '.','src/utils'),
      '@/api': resolve(__dirname, '.','src/api'),
      '@/store': resolve(__dirname, '.','src/store'),
      '@/router': resolve(__dirname, '.','src/router'),
      '@/components': resolve(__dirname, '.','src/components'),
    },
  },
}
```

### 开发指南
## 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```
