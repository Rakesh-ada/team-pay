/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFURA_API_KEY: string;
  readonly VITE_ENVIRONMENT: 'production' | 'testnet';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 