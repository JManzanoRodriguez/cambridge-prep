
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.checkAuthStatus();
    
    // Suscribirse a cambios de autenticación de Supabase
    this.supabaseService.currentUser$.subscribe(async (supabaseUser) => {
      if (supabaseUser) {
        // Obtener perfil completo del usuario
        const { data: profile } = await this.supabaseService.getUserProfile(supabaseUser.id);
        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: 'student',
            createdAt: new Date(profile.created_at),
            subscription: {
              type: profile.subscription_type as any,
              startDate: new Date(profile.created_at),
              isActive: true
            }
          };
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  /**
   * Verifica el estado de autenticación al iniciar la aplicación
   */
  private async checkAuthStatus(): Promise<void> {
    const user = await this.supabaseService.getCurrentUser();
    // El estado se actualizará automáticamente a través de la suscripción
  }

  /**
   * Inicia sesión con email y contraseña
   */
  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {
      this.supabaseService.signIn(email, password).then(({ data, error }) => {
        if (error) {
          observer.error(new Error(error.message));
        } else if (data.user) {
          // El usuario se actualizará automáticamente a través de la suscripción
          observer.next(this.currentUserSubject.value!);
          observer.complete();
        }
      });
    }).pipe(
      catchError(error => {
        console.error('Error en login', error);
        return throwError(() => new Error('Credenciales inválidas. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(name: string, email: string, password: string): Observable<User> {
    return new Observable(observer => {
      this.supabaseService.signUp(email, password, name).then(({ data, error }) => {
        if (error) {
          observer.error(new Error(error.message));
        } else if (data.user) {
          // El usuario se actualizará automáticamente a través de la suscripción
          observer.next(this.currentUserSubject.value!);
          observer.complete();
        }
      });
    }).pipe(
      catchError(error => {
        console.error('Error en registro', error);
        return throwError(() => new Error('No se pudo completar el registro. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    await this.supabaseService.signOut();
    // El estado se actualizará automáticamente a través de la suscripción
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(user: User): Observable<User> {
    return new Observable(observer => {
      this.supabaseService.updateUserProfile(user.id, {
        name: user.name,
        email: user.email
      }).then(({ error }) => {
        if (error) {
          observer.error(new Error(error.message));
        } else {
          this.currentUserSubject.next(user);
          observer.next(user);
          observer.complete();
        }
      });
    }).pipe(
      catchError(error => {
        console.error('Error al actualizar perfil', error);
        return throwError(() => new Error('No se pudo actualizar el perfil. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getUserProfile(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    return of(currentUser).pipe(
      delay(500),
      catchError(error => {
        console.error('Error al obtener perfil', error);
        return throwError(() => new Error('No se pudo obtener el perfil del usuario.'));
      })
    );
  }

  /**
   * Solicita un cambio de contraseña
   */
  requestPasswordReset(email: string): Observable<any> {
    return of({ message: 'Se ha enviado un correo con instrucciones para restablecer su contraseña.' }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al solicitar cambio de contraseña', error);
        return throwError(() => new Error('No se pudo procesar la solicitud. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Restablece la contraseña con un token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return of({ message: 'Contraseña actualizada correctamente.' }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al restablecer contraseña', error);
        return throwError(() => new Error('No se pudo restablecer la contraseña. El enlace puede haber expirado.'));
      })
    );
  }


  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string | string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }


  /**
   * Obtiene el usuario actual
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

}
