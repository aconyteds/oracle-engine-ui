/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ALLOW_REGISTRATION: string;
  readonly VITE_ALLOW_GOOGLE_SIGN_IN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
