/// <reference types="vite/client" />
import { ExternalProvider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

interface ImportMetaEnv {
  readonly VITE_TENDERLY_ACCESS_KEY: string;
  readonly VITE_TENDERLY_PROJECT: string;
  readonly VITE_TENDERLY_ACCOUNT_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
