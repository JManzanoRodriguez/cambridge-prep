
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { ProgressPoint, Recommendation, SkillAssessment, UserStats } from '../models/stats.model';
import { QuizResult } from '../models/quiz.model';
import { QuizAttempt } from '../models/attempt.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = environment.apiUrl;
  
  // BehaviorSubject para las estadísticas del usuario actual
  private userStatsSubject = new BehaviorSubject<UserStats | null>(null);
  public userStats$ = this.userStatsSubject.asObservable();
  
  // Datos mock para desarrollo
  private mockProgressHistory: ProgressPoint[] = [
    { date: new Date('2025-01-15'), score: 65 },
    { date: new Date('2025-02-15'), score: 70 },
    { date: new Date('2025-03-15'), score: 75 },
    { date: new Date('2025-04-15'), score: 72 },
    { date: new Date('2025-05-15'), score: 78 },
    { date: new Date('2025-05-25'), score: 82 }
  ];
  
  private mockSkillAssessment: SkillAssessment = {
    grammar: 85,
    vocabulary: 75,
    reading: 70,
    listening: 65,
    writing: 60,
    speaking: 55
  };
  
  private mockQuizPerformance: { [key: string]: number } = {
    grammar: 80,
    vocabulary: 65,
    reading: 75,
    listening: 60
  };
  
  private mockRecommendations: Recommendation[] = [
    { skill: 'Grammar', topic: 'Past Perfect Tense', difficulty: 'B1' },
    { skill: 'Vocabulary', topic: 'Academic Word List', difficulty: 'B2' },
    { skill: 'Listening', topic: 'Understanding Natural Speech', difficulty: 'B1' }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Cargar estadísticas del usuario actual al inicializar el servicio
    this.loadCurrentUserStats();
  }

  /**
   * Carga las estadísticas del usuario actual
   */
  private loadCurrentUserStats(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.getUserStats(user.id).subscribe(
        stats => this.userStatsSubject.next(stats),
        error => console.error('Error al cargar estadísticas del usuario', error)
      );
    }
    
    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.getUserStats(user.id).subscribe(
          stats => this.userStatsSubject.next(stats),
          error => console.error('Error al cargar estadísticas del usuario', error)
        );
      } else {
        this.userStatsSubject.next(null);
      }
    });
  }

  /**
   * Obtiene las estadísticas de un usuario
   */
  getUserStats(userId: string): Observable<UserStats> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<UserStats>(`${this.apiUrl}/stats/${userId}`)
    
    // Mock para desarrollo
    const userStats: UserStats = {
      userId: userId,
      skillAssessment: this.mockSkillAssessment,
      progressHistory: this.mockProgressHistory,
      quizPerformance: this.mockQuizPerformance
    };
    
    // Simulate API delay
    return of(userStats).pipe(
      delay(1000),
      tap(stats => {
        // Actualizar el BehaviorSubject si las estadísticas son del usuario actual
        if (this.authService.currentUser?.id === userId) {
          this.userStatsSubject.next(stats);
        }
      }),
      catchError(error => {
        console.error('Error al obtener estadísticas del usuario', error);
        return throwError(() => new Error('No se pudieron cargar las estadísticas. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene recomendaciones personalizadas para un usuario
   */
  getRecommendations(userId: string): Observable<Recommendation[]> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<Recommendation[]>(`${this.apiUrl}/recommendations/${userId}`)
    
    // Mock para desarrollo
    return of(this.mockRecommendations).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener recomendaciones', error);
        return throwError(() => new Error('No se pudieron cargar las recomendaciones. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Agrega un resultado de quiz a las estadísticas del usuario
   */
  addQuizResult(result: QuizResult): Observable<UserStats> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.post<UserStats>(`${this.apiUrl}/stats/${result.userId}/results`, result)
    
    // Mock para desarrollo - actualizar el historial de progreso
    const newProgressPoint: ProgressPoint = {
      date: result.date,
      score: result.score
    };
    
    this.mockProgressHistory.push(newProgressPoint);
    
    // Ordenar por fecha
    this.mockProgressHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Limitar a los últimos 10 puntos
    if (this.mockProgressHistory.length > 10) {
      this.mockProgressHistory = this.mockProgressHistory.slice(-10);
    }
    
    // Actualizar rendimiento por categoría
    const quizType = result.quizId.split('-')[0]; // Extraer tipo de quiz del ID
    if (quizType && this.mockQuizPerformance[quizType] !== undefined) {
      // Calcular promedio ponderado (70% valor anterior, 30% nuevo resultado)
      this.mockQuizPerformance[quizType] = Math.round(
        this.mockQuizPerformance[quizType] * 0.7 + result.score * 0.3
      );
    }
    
    // Actualizar evaluación de habilidades basada en el tipo de quiz
    if (quizType && this.mockSkillAssessment[quizType] !== undefined) {
      // Calcular promedio ponderado (80% valor anterior, 20% nuevo resultado)
      this.mockSkillAssessment[quizType] = Math.round(
        this.mockSkillAssessment[quizType] * 0.8 + result.score * 0.2
      );
    }
    
    return this.getUserStats(result.userId);
  }

  /**
   * Actualiza la evaluación de habilidades de un usuario
   */
  updateSkillAssessment(userId: string, assessment: SkillAssessment): Observable<UserStats> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.put<UserStats>(`${this.apiUrl}/stats/${userId}/skills`, assessment)
    
    // Mock para desarrollo
    this.mockSkillAssessment = assessment;
    
    return this.getUserStats(userId);
  }

  /**
   * Calcula el nivel general del usuario basado en sus habilidades
   */
  calculateOverallLevel(stats: UserStats): string {
    if (!stats || !stats.skillAssessment) {
      return 'A1';
    }
    
    const { grammar, vocabulary, reading, listening, writing, speaking } = stats.skillAssessment;
    
    // Calcular promedio de todas las habilidades
    const totalSkills = 6;
    const sum = grammar + vocabulary + reading + listening + writing + speaking;
    const average = sum / totalSkills;
    
    // Determinar nivel basado en el promedio
    if (average >= 90) return 'C2';
    if (average >= 80) return 'C1';
    if (average >= 70) return 'B2';
    if (average >= 60) return 'B1';
    if (average >= 50) return 'A2';
    return 'A1';
  }

  /**
   * Calcula el progreso del usuario hacia el siguiente nivel
   */
  calculateLevelProgress(stats: UserStats): number {
    if (!stats || !stats.skillAssessment) {
      return 0;
    }
    
    const { grammar, vocabulary, reading, listening, writing, speaking } = stats.skillAssessment;
    
    // Calcular promedio de todas las habilidades
    const totalSkills = 6;
    const sum = grammar + vocabulary + reading + listening + writing + speaking;
    const average = sum / totalSkills;
    
    // Calcular progreso dentro del nivel actual
    if (average >= 90) return 100; // C2 es el nivel máximo
    if (average >= 80) return (average - 80) * 10; // Progreso en C1
    if (average >= 70) return (average - 70) * 10; // Progreso en B2
    if (average >= 60) return (average - 60) * 10; // Progreso en B1
    if (average >= 50) return (average - 50) * 10; // Progreso en A2
    return average * 2; // Progreso en A1
  }

  /**
   * Analiza los resultados de un intento de quiz para actualizar estadísticas
   */
  analyzeQuizAttempt(attempt: QuizAttempt): Observable<UserStats> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.post<UserStats>(`${this.apiUrl}/stats/${attempt.userId}/analyze`, attempt)
    
    // Mock para desarrollo - crear un resultado de quiz a partir del intento
    if (!attempt.completed || attempt.score === undefined) {
      return throwError(() => new Error('El intento no está completo'));
    }
    
    const quizResult: QuizResult = {
      id: `result-${Date.now()}`,
      quizId: attempt.quizId,
      userId: attempt.userId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      date: attempt.endTime || new Date()
    };
    
    // Usar el método existente para agregar el resultado
    return this.addQuizResult(quizResult);
  }

  /**
   * Obtiene el historial de progreso para una habilidad específica
   */
  getSkillProgressHistory(userId: string, skill: string): Observable<ProgressPoint[]> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<ProgressPoint[]>(`${this.apiUrl}/stats/${userId}/progress/${skill}`)
    
    // Mock para desarrollo - generar datos específicos para la habilidad
    const skillHistory: ProgressPoint[] = [];
    const now = new Date();
    
    // Generar 6 puntos de progreso para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      
      // Generar un valor basado en la habilidad y con tendencia ascendente
      let baseScore = 50;
      
      // Ajustar según la habilidad
      if (skill === 'grammar') baseScore += 15;
      if (skill === 'vocabulary') baseScore += 10;
      if (skill === 'reading') baseScore += 5;
      if (skill === 'listening') baseScore -= 5;
      if (skill === 'writing') baseScore -= 10;
      if (skill === 'speaking') baseScore -= 15;
      
      // Añadir progresión y algo de aleatoriedad
      const score = Math.min(100, Math.max(0, baseScore + i * 5 + Math.floor(Math.random() * 10) - 5));
      
      skillHistory.push({ date, score });
    }
    
    // Simulate API delay
    return of(skillHistory).pipe(
      delay(1000),
      catchError(error => {
        console.error(`Error al obtener historial de progreso para ${skill}`, error);
        return throwError(() => new Error('No se pudo cargar el historial de progreso. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene estadísticas comparativas con otros usuarios
   */
  getComparisonStats(userId: string): Observable<any> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<any>(`${this.apiUrl}/stats/${userId}/comparison`)
    
    // Mock para desarrollo
    const comparisonStats = {
      userPercentile: 75, // El usuario está en el percentil 75
      averageScores: {
        grammar: 70,
        vocabulary: 68,
        reading: 65,
        listening: 62,
        writing: 60,
        speaking: 58
      },
      userRank: 120, // Posición del usuario entre todos los usuarios
      totalUsers: 1500
    };
    
    // Simulate API delay
    return of(comparisonStats).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener estadísticas comparativas', error);
        return throwError(() => new Error('No se pudieron cargar las estadísticas comparativas. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene las estadísticas del usuario actual
   */
  get currentUserStats(): UserStats | null {
    return this.userStatsSubject.value;
  }
}
