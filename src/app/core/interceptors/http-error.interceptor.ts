import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

/**
 * Interceptor para manejar errores HTTP de forma centralizada
 * 
 * Funcionalidades:
 * 1. Reintenta peticiones fallidas (excepto errores 4xx y 5xx)
 * 2. Muestra mensajes de error amigables al usuario
 * 3. Registra errores en la consola para depuración
 * 4. Maneja diferentes tipos de errores de forma específica
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private toastController: ToastController) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      // Reintentar la petición hasta 2 veces en caso de errores de red
      retry(2),
      
      // Capturar y manejar errores
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente (problemas de red, etc.)
          errorMessage = `Error: ${error.error.message}`;
          console.error('Error del cliente:', error.error.message);
        } else {
          // Error del lado del servidor
          errorMessage = this.getServerErrorMessage(error);
          console.error(
            `Código de error: ${error.status}, ` +
            `Mensaje: ${error.message}, ` +
            `Detalles: ${JSON.stringify(error.error)}`
          );
        }
        
        // Mostrar mensaje de error al usuario (excepto en errores 401 que maneja el AuthTokenInterceptor)
        if (error.status !== 401) {
          this.showErrorToast(errorMessage);
        }
        
        // Propagar el error para que los componentes puedan manejarlo si es necesario
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Determina si se debe reintentar una petición fallida
   */
  private shouldRetry(error: any): boolean {
    // No reintentar errores 4xx o 5xx
    if (error instanceof HttpErrorResponse) {
      if (error.status >= 400 && error.status < 600) {
        return false;
      }
    }
    return true;
  }

  /**
   * Obtiene un mensaje de error amigable según el código de estado HTTP
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return this.getBadRequestMessage(error);
      case 401:
        return 'No tiene autorización para acceder a este recurso.';
      case 403:
        return 'Acceso denegado. No tiene permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 408:
        return 'La solicitud ha excedido el tiempo de espera. Por favor, inténtelo de nuevo.';
      case 409:
        return 'La solicitud no pudo completarse debido a un conflicto con el estado actual del recurso.';
      case 422:
        return this.getValidationErrorMessage(error);
      case 429:
        return 'Demasiadas solicitudes. Por favor, espere un momento antes de intentarlo de nuevo.';
      case 500:
        return 'Error interno del servidor. Por favor, inténtelo más tarde.';
      case 503:
        return 'Servicio no disponible. Por favor, inténtelo más tarde.';
      default:
        return 'Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo.';
    }
  }

  /**
   * Obtiene un mensaje detallado para errores de validación (422)
   */
  private getValidationErrorMessage(error: HttpErrorResponse): string {
    if (error.error && error.error.errors) {
      // Extraer mensajes de error de validación
      const validationErrors = error.error.errors;
      const errorMessages = Object.keys(validationErrors)
        .map(key => validationErrors[key])
        .reduce((acc, val) => acc.concat(val), []);
      
      if (errorMessages.length > 0) {
        return errorMessages.join('. ');
      }
    }
    
    return 'Los datos proporcionados no son válidos.';
  }

  /**
   * Obtiene un mensaje detallado para errores de solicitud incorrecta (400)
   */
  private getBadRequestMessage(error: HttpErrorResponse): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    
    return 'La solicitud contiene datos incorrectos o incompletos.';
  }

  /**
   * Muestra un mensaje de error en un toast
   */
  private async showErrorToast(message: string): Promise<void> {
    if (!environment.production) {
      // En desarrollo, mostrar mensajes más detallados
      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
        buttons: [
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]
      });
      
      await toast.present();
    } else {
      // En producción, mostrar mensajes más genéricos
      const toast = await this.toastController.create({
        message: 'Ha ocurrido un error. Por favor, inténtelo de nuevo.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      
      await toast.present();
    }
  }
}
