/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_ENV: string;
    readonly VITE_SENTRY_DSN: string;
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    // Feature Flags, Checks for "true", loaded from .env or Github Actions variables
    readonly VITE_ALLOW_REGISTRATION: string;
    readonly VITE_MONETIZATION_ENABLED: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
