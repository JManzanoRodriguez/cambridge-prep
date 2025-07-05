import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthTokenInterceptor } from './auth-token.interceptor';
import { HttpErrorInterceptor } from './http-error.interceptor';

/**
 * Proveedores para todos los interceptores HTTP de la aplicación
 * El orden es importante: AuthTokenInterceptor debe ejecutarse antes que HttpErrorInterceptor
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
];
