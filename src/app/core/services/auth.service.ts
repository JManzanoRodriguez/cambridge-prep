import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, from, map } from 'rxjs';
import { User } from '../models/user.model';
import { SupabaseService } from './supabase.service';

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

  constructor(private supabaseService: SupabaseService) {
    this.checkAuthStatus();

    // Suscripción a cambios de autenticación de Supabase
    this.supabaseService.currentUser$.subscribe(async (supabaseUser) => {
      if (supabaseUser) {
        // Opcional: si tu SupabaseService expone sesión, puedes guardar el token aquí.
        // try {
        //   const { data } = await this.supabaseService.getSession?.();
        //   this.accessToken = data?.session?.access_token ?? this.accessToken;
        // } catch {}

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
        this.accessToken = null;
      }
    });
  }

  /**
   * Verifica el estado de autenticación al iniciar la aplicación
   */
  private async checkAuthStatus(): Promise<void> {
    await this.supabaseService.getCurrentUser();
    // El estado se actualizará automáticamente a través de la suscripción
  }

  /**
   * Inicia sesión con email y contraseña
   * - Actualiza this.accessToken si viene sesión
   */
  login(email: string, password: string): Observable<User> {
    return new Observable<User>(observer => {
      this.supabaseService.signIn(email, password).then(({ data, error }) => {
        if (error) {
          observer.error(new Error(error.message));
          return;
        }
        // Guarda el token si hay sesión
        this.accessToken = data?.session?.access_token ?? this.accessToken;

        // El usuario se actualizará por la suscripción a currentUser$
        const user = this.currentUserSubject.value;
        if (user) {
          observer.next(user);
          observer.complete();
        } else {
          // Si aún no llegó el perfil por la suscripción, esperamos un tick
          const sub = this.currentUser$.subscribe(u => {
            if (u) {
              sub.unsubscribe();
              observer.next(u);
              observer.complete();
            }
          });
        }
      }).catch(err => observer.error(err));
    });
  }

  /**
   * Registra un nuevo usuario
   */
  register(name: string, email: string, password: string): Observable<User> {
    return new Observable<User>(observer => {
      this.supabaseService.signUp(email, password, name).then(({ data, error }) => {
        if (error) {
          observer.error(new Error(error.message));
          return;
        }
        // En signUp puede no venir sesión (según políticas de confirmación)
        this.accessToken = data?.session?.access_token ?? this.accessToken;

        const sub = this.currentUser$.subscribe(u => {
          if (u) {
            sub.unsubscribe();
            observer.next(u);
            observer.complete();
          }
        });
      }).catch(err => observer.error(err));
    });
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    await this.supabaseService.signOut();
    this.accessToken = null;
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
      return new Observable<User>(observer => {
        observer.error(new Error('Usuario no autenticado'));
      });
    }
    return of(currentUser).pipe(delay(200));
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
}
