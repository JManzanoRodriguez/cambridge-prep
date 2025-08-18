// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // openaiApiKey: '', // Se configurará en el backend
  supabase: {
    url: 'https://hdrlwgjlkqtbwlbizqvl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkcmx3Z2psa3F0YndsYml6cXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTU3ODcsImV4cCI6MjA3MTA5MTc4N30.edbQHk6WPIMamzn5tw2y4bAs97k71rwS2kqCa-KfQfI'
  },
  appVersion: '1.0.0',
  appName: 'Cambridge Prep App',
  tokenExpirationTime: 3600, // segundos (1 hora)
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  debugMode: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
