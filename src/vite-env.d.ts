/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ALLOW_REGISTRATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
