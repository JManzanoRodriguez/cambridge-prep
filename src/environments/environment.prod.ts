export const environment = {
  production: true,
  apiUrl: 'https://api.cambridgeprep.com/api',
  openaiApiKey: '', // Se configurará en el backend
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
  },
  appVersion: '1.0.0',
  appName: 'Cambridge Prep App',
  tokenExpirationTime: 3600, // segundos (1 hora)
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  debugMode: false
};
