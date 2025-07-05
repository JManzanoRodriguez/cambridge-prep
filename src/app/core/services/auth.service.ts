
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: string;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenExpirationTimer: any;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  /**
   * Verifica el estado de autenticación al iniciar la aplicación
   * Intenta restaurar la sesión desde el token almacenado
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    try {
      const decodedToken = this.getDecodedToken(token);
      
      // Verificar si el token ha expirado
      if (this.isTokenExpired(decodedToken)) {
        this.refreshToken().subscribe();
        return;
      }

      // Cargar datos del usuario desde localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.setAutoLogout(decodedToken);
      } else {
        // Si tenemos token pero no usuario, obtener perfil
        this.getUserProfile().subscribe();
      }
    } catch (error) {
      console.error('Error al decodificar el token', error);
      this.logout();
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  login(email: string, password: string): Observable<User> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
    
    // Mock login para desarrollo
    const mockAuthResponse: AuthResponse = {
      user: {
        id: '1',
        name: 'John Doe',
        email: email,
        language: 'english',
        notificationsEnabled: true,
        role: 'student',
        createdAt: new Date(),
        lastLogin: new Date(),
        subscription: {
          type: 'premium',
          startDate: new Date(),
          isActive: true
        },
        preferences: {
          theme: 'system',
          studyReminders: true,
          studyGoal: 30,
          weeklyGoal: 5
        }
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3MTY5MjgwMDAsImlhdCI6MTcxNjg0MTYwMH0.8dPJrt_QgVfDTDm7FQJReBXGu1xyA-JRCRdStVo5T0Y',
      refreshToken: 'refresh-token-mock'
    };
    
    // Simulate API delay
    return of(mockAuthResponse).pipe(
      delay(1000),
      tap(response => this.handleAuthentication(response)),
      map(response => response.user),
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
    // En una aplicación real, esto llamaría a una API
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { name, email, password })
    
    // Mock registration para desarrollo
    const mockAuthResponse: AuthResponse = {
      user: {
        id: '2',
        name: name,
        email: email,
        language: 'english',
        notificationsEnabled: true,
        role: 'student',
        createdAt: new Date(),
        lastLogin: new Date(),
        subscription: {
          type: 'free',
          startDate: new Date(),
          isActive: true
        },
        preferences: {
          theme: 'system',
          studyReminders: true
        }
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3MTY5MjgwMDAsImlhdCI6MTcxNjg0MTYwMH0.8dPJrt_QgVfDTDm7FQJReBXGu1xyA-JRCRdStVo5T0Y',
      refreshToken: 'refresh-token-mock'
    };
    
    // Simulate API delay
    return of(mockAuthResponse).pipe(
      delay(1000),
      tap(response => this.handleAuthentication(response)),
      map(response => response.user),
      catchError(error => {
        console.error('Error en registro', error);
        return throwError(() => new Error('No se pudo completar el registro. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    // En una aplicación real, podríamos notificar al servidor
    // this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe();
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(user: User): Observable<User> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user)
    
    // Mock update para desarrollo
    return of(user).pipe(
      delay(1000),
      tap(updatedUser => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
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
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<User>(`${this.apiUrl}/users/me`)
    
    // Mock para desarrollo
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
    // En una aplicación real, esto llamaría a una API
    // return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email })
    
    // Mock para desarrollo
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
    // En una aplicación real, esto llamaría a una API
    // return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword })
    
    // Mock para desarrollo
    return of({ message: 'Contraseña actualizada correctamente.' }).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al restablecer contraseña', error);
        return throwError(() => new Error('No se pudo restablecer la contraseña. El enlace puede haber expirado.'));
      })
    );
  }

  /**
   * Refresca el token de autenticación
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return of(false);
    }
    
    // En una aplicación real, esto llamaría a una API
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
    
    // Mock para desarrollo
    const mockAuthResponse: AuthResponse = {
      user: this.currentUserSubject.value || {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        language: 'english',
        notificationsEnabled: true,
        role: 'student',
        createdAt: new Date(),
        lastLogin: new Date()
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3MTcwMTQ0MDAsImlhdCI6MTcxNjkyODAwMH0.8dPJrt_QgVfDTDm7FQJReBXGu1xyA-JRCRdStVo5T0Y',
      refreshToken: 'new-refresh-token-mock'
    };
    
    return of(mockAuthResponse).pipe(
      delay(500),
      tap(response => this.handleAuthentication(response)),
      map(() => true),
      catchError(error => {
        console.error('Error al refrescar token', error);
        this.logout();
        return of(false);
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
   * Obtiene el token actual
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Obtiene el usuario actual
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Maneja la respuesta de autenticación
   */
  private handleAuthentication(authResponse: AuthResponse): void {
    const { user, token, refreshToken } = authResponse;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    // Configurar auto-logout basado en la expiración del token
    const decodedToken = this.getDecodedToken(token);
    this.setAutoLogout(decodedToken);
  }

  /**
   * Configura el temporizador para cerrar sesión automáticamente
   */
  private setAutoLogout(decodedToken: TokenPayload): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    const expirationDate = new Date(decodedToken.exp * 1000);
    const expiresIn = expirationDate.getTime() - new Date().getTime();
    
    // Refrescar el token 5 minutos antes de que expire
    const refreshTime = expiresIn - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshToken().subscribe();
      }, refreshTime);
    } else {
      // Si ya estamos dentro de la ventana de 5 minutos, refrescar inmediatamente
      this.refreshToken().subscribe();
    }
  }

  /**
   * Decodifica el token JWT
   */
  private getDecodedToken(token: string): TokenPayload {
    return jwtDecode<TokenPayload>(token);
  }

  /**
   * Verifica si el token ha expirado
   */
  private isTokenExpired(decodedToken: TokenPayload): boolean {
    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate <= new Date();
  }
}
