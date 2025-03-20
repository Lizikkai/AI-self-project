declare interface ViteEnv {
  VITE_API_BASE_URL: string;
}

interface ImportMetaEnv extends ViteEnv {
  // 这里可以添加其他环境变量的类型
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
