// Class containing all environment variable references
// (this is a .d.xx file so this class can be accessed globally in /frontend/)
interface ImportMetaEnv {
  // Frontend Configuration
  readonly VITE_PORT: number;

  // Firebase Configuration environment variables
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;

  // Add more environment variables here if needed -- NEED TO ADD HERE AND IN .env FILE
}

// Wrapper class containing access to all environment variable references
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
