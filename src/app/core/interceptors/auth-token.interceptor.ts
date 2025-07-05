import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

/**
 * Interceptor para manejar la autenticación mediante tokens JWT
 * 
 * Funcionalidades:
 * 1. Añade el token de autenticación a todas las peticiones HTTP
 * 2. Maneja la renovación automática del token cuando expira
 * 3. Previene múltiples intentos de renovación simultáneos
 */
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptar peticiones a URLs externas o a la API de autenticación
    if (!request.url.startsWith(environment.apiUrl) || 
        request.url.includes('/auth/login') || 
        request.url.includes('/auth/register') ||
        request.url.includes('/auth/refresh-token')) {
      return next.handle(request);
    }

    // Obtener el token actual
    const token = this.authService.getToken();
    
    // Si hay token, añadirlo a la petición
    if (token) {
      request = this.addToken(request, token);
    }

    // Procesar la petición y manejar errores
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Error 401 Unauthorized - Token expirado o inválido
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Añade el token de autenticación a la cabecera de la petición
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Maneja errores 401 (Unauthorized) intentando renovar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      // Iniciar proceso de renovación
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(success => {
          this.isRefreshing = false;
          
          if (success) {
            // Si la renovación fue exitosa, notificar a otros observadores
            this.refreshTokenSubject.next(true);
            // Reintentar la petición original con el nuevo token
            return next.handle(this.addToken(request, this.authService.getToken() || ''));
          }
          
          // Si la renovación falló, cerrar sesión y rechazar la petición
          this.authService.logout();
          return throwError(() => new Error('La sesión ha expirado. Por favor, inicie sesión nuevamente.'));
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Si ya hay un proceso de renovación en curso, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          return next.handle(this.addToken(request, this.authService.getToken() || ''));
        })
      );
    }
  }
}
