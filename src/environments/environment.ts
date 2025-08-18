// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  openaiApiKey: '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', // Agregar tu API key de OpenAI aquí
  appVersion: '1.0.0',
  appName: 'Cambridge Prep App',
  tokenExpirationTime: 3600, // segundos (1 hora)
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  debugMode: true,
  // firebase: {
  //   apiKey: '…',
  //   authDomain: '…',
  //   projectId: '…',
  //   storageBucket: '…',
  //   messagingSenderId: '…',
  //   appId: '…',
  //   measurementId: '…' // opcional
  // }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
