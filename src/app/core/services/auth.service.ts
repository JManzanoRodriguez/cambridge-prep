import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, from, map, catchError, throwError, tap } from 'rxjs';
import { User } from '../models/user.model';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /** Token de acceso actual (lo actualizamos tras login / refresh) */
  private accessToken: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeAuth();

    // Suscripción a cambios de autenticación de Supabase
    this.supabaseService.currentUser$.subscribe(async (supabaseUser) => {
      if (supabaseUser) {
        await this.loadUserProfile(supabaseUser);
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.accessToken = null;
      }
    });
  }

  /**
   * Inicializa el estado de autenticación
   */
  private async initializeAuth(): Promise<void> {
    try {
      const user = await this.supabaseService.getCurrentUser();
      if (user) {
        await this.loadUserProfile(user);
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
    }
  }

  /**
   * Carga el perfil completo del usuario
   */
  private async loadUserProfile(supabaseUser: any): Promise<void> {
    try {
      const { data: profile, error: profileError } = await this.supabaseService.getUserProfile(supabaseUser.id);
      
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
      } else if (profileError) {
        // Crear usuario temporal con datos de auth
        const tempUser: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
          email: supabaseUser.email,
          role: 'student',
          createdAt: new Date(),
          subscription: {
            type: 'free',
            startDate: new Date(),
            isActive: true
          }
        };
        this.currentUserSubject.next(tempUser);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  login(email: string, password: string): Observable<User> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(this.getAuthErrorMessage(error.message));
        }

        // Guardar token de sesión
        this.accessToken = data?.session?.access_token ?? null;

        // Crear usuario temporal mientras se carga el perfil completo
        const tempUser: User = {
          id: data.user?.id || '',
          name: data.user?.user_metadata?.['name'] || 'Usuario',
          email: data.user?.email || email,
          role: 'student',
          createdAt: new Date(),
          subscription: {
            type: 'free',
            startDate: new Date(),
            isActive: true
          }
        };

        return tempUser;
      }),
      tap(() => {
        // Forzar recarga del estado después del login
        setTimeout(() => this.initializeAuth(), 100);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(name: string, email: string, password: string): Observable<User> {
    return from(this.supabaseService.signUp(email, password, name)).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(this.getAuthErrorMessage(error.message));
        }

        // Guardar token si hay sesión (puede no haberla si requiere confirmación)
        this.accessToken = data?.session?.access_token ?? null;

        console.log('Registro exitoso');
        // Crear usuario mock para devolver inmediatamente
        const user: User = {
          id: data.user?.id || '',
          name: name,
          email: email,
          role: 'student',
          createdAt: new Date(),
          subscription: {
            type: 'free',
            startDate: new Date(),
            isActive: true
          }
        };

        return user;
      }),
      tap(() => {
        // Forzar recarga del estado después del registro
        setTimeout(() => this.initializeAuth(), 100);
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      console.log('Logout exitoso');
      this.accessToken = null;
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(user: User): Observable<User> {
    return new Observable<User>(observer => {
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
      }).catch(err => observer.error(err));
    });
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getUserProfile(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    return of(currentUser);
  }

  /**
   * Solicita un cambio de contraseña (placeholder)
   */
  requestPasswordReset(email: string): Observable<any> {
    return of({ message: 'Se ha enviado un correo con instrucciones para restablecer su contraseña.' })
      .pipe(delay(500));
  }

  /**
   * Restablece la contraseña con un token (placeholder)
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return of({ message: 'Contraseña actualizada correctamente.' })
      .pipe(delay(500));
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string | string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  }

  /**
   * Obtiene el usuario actual (snapshot)
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * === Métodos requeridos por tu interceptor ===
   */

  /** Devuelve el token actual (si lo hay) */
  getToken(): string | null {
    return this.accessToken;
  }

  /**
   * Intenta refrescar el token y devuelve el nuevo token (o null si falla)
   * Se apoya en Supabase v2: auth.refreshSession()
   */
  refreshToken(): Observable<string | null> {
    // Si tu SupabaseService expone refreshSession():
    const maybeRefresh = (this.supabaseService as any).refreshSession?.bind(this.supabaseService);
    if (maybeRefresh) {
      return from(maybeRefresh()).pipe(
        map((res: any) => {
          const token = res?.data?.session?.access_token ?? null;
          this.accessToken = token;
          return token;
        })
      );
    }

    // Si expone el cliente directamente:
    const client: any = (this.supabaseService as any).supabase || (this.supabaseService as any).client;
    if (client?.auth?.refreshSession) {
      return from(client.auth.refreshSession()).pipe(
        map((res: any) => {
          const token = res?.data?.session?.access_token ?? null;
          this.accessToken = token;
          return token;
        })
      );
    }

    // Fallback (sin refresh disponible)
    return of(null);
  }

  /**
   * Convierte errores de Supabase en mensajes amigables
   */
  private getAuthErrorMessage(error: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Credenciales incorrectas. Verifica tu email y contraseña.',
      'Email not confirmed': 'Email no confirmado. Verifica la configuración de Supabase.',
      'User already registered': 'Este email ya está registrado. Intenta iniciar sesión.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Unable to validate email address: invalid format': 'El formato del email no es válido.',
      'signup is disabled': 'El registro está temporalmente deshabilitado.',
      'Invalid email or password': 'Email o contraseña incorrectos.',
      'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.',
    };

    return errorMap[error] || `Error de autenticación: ${error}`;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
