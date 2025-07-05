
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Quiz, QuizQuestion, QuizResult } from '../models/quiz.model';
import { QuizAttempt, AttemptSummary, QuestionAnalysis } from '../models/attempt.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = environment.apiUrl;
  
  // BehaviorSubject para el quiz actual
  private currentQuizSubject = new BehaviorSubject<Quiz | null>(null);
  public currentQuiz$ = this.currentQuizSubject.asObservable();
  
  // BehaviorSubject para el intento actual
  private currentAttemptSubject = new BehaviorSubject<QuizAttempt | null>(null);
  public currentAttempt$ = this.currentAttemptSubject.asObservable();
  
  // Datos mock para desarrollo
  private grammarQuestions: QuizQuestion[] = [
    {
      id: 1,
      text: 'Choose the correct form of the verb: "She _____ tennis every Sunday."',
      options: [
        { value: 'play', text: 'play' },
        { value: 'plays', text: 'plays' },
        { value: 'playing', text: 'playing' },
        { value: 'is playing', text: 'is playing' }
      ],
      correctAnswer: 'plays'
    },
    {
      id: 2,
      text: 'Select the correct sentence:',
      options: [
        { value: 'a', text: 'I have been working here since three years.' },
        { value: 'b', text: 'I have been working here for three years.' },
        { value: 'c', text: 'I am working here for three years.' },
        { value: 'd', text: 'I work here since three years.' }
      ],
      correctAnswer: 'b'
    },
    {
      id: 3,
      text: 'Choose the correct conditional form: "If it _____ tomorrow, we will cancel the picnic."',
      options: [
        { value: 'rains', text: 'rains' },
        { value: 'will rain', text: 'will rain' },
        { value: 'would rain', text: 'would rain' },
        { value: 'is raining', text: 'is raining' }
      ],
      correctAnswer: 'rains'
    }
  ];
  
  private vocabularyQuestions: QuizQuestion[] = [
    {
      id: 1,
      text: 'What is the synonym of "enormous"?',
      options: [
        { value: 'tiny', text: 'tiny' },
        { value: 'huge', text: 'huge' },
        { value: 'beautiful', text: 'beautiful' },
        { value: 'dangerous', text: 'dangerous' }
      ],
      correctAnswer: 'huge'
    },
    {
      id: 2,
      text: 'Choose the word that best completes the sentence: "The detective found a vital _____ at the crime scene."',
      options: [
        { value: 'clue', text: 'clue' },
        { value: 'hint', text: 'hint' },
        { value: 'sign', text: 'sign' },
        { value: 'mark', text: 'mark' }
      ],
      correctAnswer: 'clue'
    },
    {
      id: 3,
      text: 'What is the antonym of "generous"?',
      options: [
        { value: 'kind', text: 'kind' },
        { value: 'giving', text: 'giving' },
        { value: 'stingy', text: 'stingy' },
        { value: 'wealthy', text: 'wealthy' }
      ],
      correctAnswer: 'stingy'
    }
  ];
  
  private readingQuestions: QuizQuestion[] = [
    {
      id: 1,
      text: 'According to the passage, what is the main reason for climate change?',
      options: [
        { value: 'a', text: 'Natural cycles of the Earth' },
        { value: 'b', text: 'Human activities and greenhouse gas emissions' },
        { value: 'c', text: 'Solar radiation changes' },
        { value: 'd', text: 'Volcanic eruptions' }
      ],
      correctAnswer: 'b'
    },
    {
      id: 2,
      text: 'What can be inferred from the passage about renewable energy?',
      options: [
        { value: 'a', text: 'It is too expensive to implement globally' },
        { value: 'b', text: 'It is less efficient than fossil fuels' },
        { value: 'c', text: 'It is a viable solution to reduce carbon emissions' },
        { value: 'd', text: 'It requires too much land to be practical' }
      ],
      correctAnswer: 'c'
    }
  ];
  
  private listeningQuestions: QuizQuestion[] = [
    {
      id: 1,
      text: 'What is the speaker\'s main point about digital communication?',
      options: [
        { value: 'a', text: 'It has completely replaced face-to-face interaction' },
        { value: 'b', text: 'It has both benefits and drawbacks for society' },
        { value: 'c', text: 'It should be avoided whenever possible' },
        { value: 'd', text: 'It is primarily beneficial for business purposes' }
      ],
      correctAnswer: 'b'
    },
    {
      id: 2,
      text: 'According to the speaker, what is one advantage of social media?',
      options: [
        { value: 'a', text: 'It always provides accurate information' },
        { value: 'b', text: 'It helps people avoid real-world interactions' },
        { value: 'c', text: 'It allows people to connect across geographical boundaries' },
        { value: 'd', text: 'It is completely secure and private' }
      ],
      correctAnswer: 'c'
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene un quiz por tipo y nivel
   */
  getQuizByType(type: string, level: string): Observable<Quiz> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<Quiz>(`${this.apiUrl}/quizzes?type=${type}&level=${level}`)
    
    // Mock quiz data para desarrollo
    let questions: QuizQuestion[] = [];
    
    switch (type) {
      case 'grammar':
        questions = this.grammarQuestions;
        break;
      case 'vocabulary':
        questions = this.vocabularyQuestions;
        break;
      case 'reading':
        questions = this.readingQuestions;
        break;
      case 'listening':
        questions = this.listeningQuestions;
        break;
      default:
        questions = this.grammarQuestions;
    }
    
    const quiz: Quiz = {
      id: `${type}-${level}-${Date.now()}`,
      type: type as any,
      level: level as any,
      questions: questions
    };
    
    // Guardar el quiz actual en el BehaviorSubject
    this.currentQuizSubject.next(quiz);
    
    // Simulate API delay
    return of(quiz).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener quiz', error);
        return throwError(() => new Error('No se pudo cargar el quiz. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene un test de diagnóstico
   */
  getDiagnosticTest(): Observable<Quiz> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<Quiz>(`${this.apiUrl}/quizzes/diagnostic`)
    
    // Mock diagnostic test para desarrollo
    const diagnosticQuestions: QuizQuestion[] = [
      {
        id: 1,
        text: 'Choose the correct option to complete the sentence: "She _____ to the store yesterday."',
        options: [
          { value: 'go', text: 'go' },
          { value: 'goes', text: 'goes' },
          { value: 'went', text: 'went' },
          { value: 'going', text: 'going' }
        ],
        correctAnswer: 'went'
      },
      {
        id: 2,
        text: 'Which sentence is grammatically correct?',
        options: [
          { value: 'a', text: 'I have been to Paris last year.' },
          { value: 'b', text: 'I went to Paris last year.' },
          { value: 'c', text: 'I have gone to Paris last year.' },
          { value: 'd', text: 'I am going to Paris last year.' }
        ],
        correctAnswer: 'b'
      },
      {
        id: 3,
        text: 'Choose the correct word to complete the sentence: "The book is _____ the table."',
        options: [
          { value: 'in', text: 'in' },
          { value: 'on', text: 'on' },
          { value: 'at', text: 'at' },
          { value: 'by', text: 'by' }
        ],
        correctAnswer: 'on'
      },
      {
        id: 4,
        text: 'What is the past participle of "speak"?',
        options: [
          { value: 'speak', text: 'speak' },
          { value: 'spoke', text: 'spoke' },
          { value: 'spoken', text: 'spoken' },
          { value: 'speaking', text: 'speaking' }
        ],
        correctAnswer: 'spoken'
      },
      {
        id: 5,
        text: 'Choose the correct conditional sentence:',
        options: [
          { value: 'a', text: 'If I will see him, I will tell him.' },
          { value: 'b', text: 'If I see him, I tell him.' },
          { value: 'c', text: 'If I see him, I will tell him.' },
          { value: 'd', text: 'If I would see him, I will tell him.' }
        ],
        correctAnswer: 'c'
      }
    ];
    
    const diagnosticTest: Quiz = {
      id: 'diagnostic',
      type: 'grammar',
      level: 'b1',
      questions: diagnosticQuestions
    };
    
    // Guardar el quiz actual en el BehaviorSubject
    this.currentQuizSubject.next(diagnosticTest);
    
    // Simulate API delay
    return of(diagnosticTest).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener test diagnóstico', error);
        return throwError(() => new Error('No se pudo cargar el test diagnóstico. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Inicia un nuevo intento de quiz
   */
  startQuizAttempt(quizId: string): Observable<QuizAttempt> {
    const user = this.authService.currentUser;
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const quiz = this.currentQuizSubject.value;
    if (!quiz) {
      return throwError(() => new Error('No hay un quiz activo'));
    }
    
    // En una aplicación real, esto llamaría a una API
    // return this.http.post<QuizAttempt>(`${this.apiUrl}/attempts`, { quizId, userId: user.id })
    
    // Mock para desarrollo
    const newAttempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      userId: user.id,
      quizId: quizId,
      startTime: new Date(),
      completed: false,
      answers: [],
      totalQuestions: quiz.questions.length
    };
    
    // Guardar el intento actual en el BehaviorSubject
    this.currentAttemptSubject.next(newAttempt);
    
    // Simulate API delay
    return of(newAttempt).pipe(
      delay(500),
      catchError(error => {
        console.error('Error al iniciar intento', error);
        return throwError(() => new Error('No se pudo iniciar el quiz. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Registra una respuesta en el intento actual
   */
  saveAnswer(questionId: number, selectedAnswer: string): Observable<QuizAttempt> {
    const currentAttempt = this.currentAttemptSubject.value;
    if (!currentAttempt) {
      return throwError(() => new Error('No hay un intento activo'));
    }
    
    const quiz = this.currentQuizSubject.value;
    if (!quiz) {
      return throwError(() => new Error('No hay un quiz activo'));
    }
    
    // Encontrar la pregunta correspondiente
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      return throwError(() => new Error('Pregunta no encontrada'));
    }
    
    // Verificar si la respuesta es correcta
    const isCorrect = question.correctAnswer === selectedAnswer;
    
    // Crear o actualizar la respuesta
    const existingAnswerIndex = currentAttempt.answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      // Actualizar respuesta existente
      currentAttempt.answers[existingAnswerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: 30 // Mock tiempo en segundos
      };
    } else {
      // Agregar nueva respuesta
      currentAttempt.answers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: 30 // Mock tiempo en segundos
      });
    }
    
    // En una aplicación real, esto llamaría a una API
    // return this.http.put<QuizAttempt>(`${this.apiUrl}/attempts/${currentAttempt.id}/answers`, { 
    //   questionId, selectedAnswer, isCorrect 
    // })
    
    // Actualizar el BehaviorSubject
    this.currentAttemptSubject.next({...currentAttempt});
    
    // Simulate API delay
    return of(currentAttempt).pipe(
      delay(300),
      catchError(error => {
        console.error('Error al guardar respuesta', error);
        return throwError(() => new Error('No se pudo guardar la respuesta. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Completa el intento actual y calcula el resultado
   */
  completeAttempt(): Observable<QuizResult> {
    const currentAttempt = this.currentAttemptSubject.value;
    if (!currentAttempt) {
      return throwError(() => new Error('No hay un intento activo'));
    }
    
    const quiz = this.currentQuizSubject.value;
    if (!quiz) {
      return throwError(() => new Error('No hay un quiz activo'));
    }
    
    // Calcular puntuación
    const correctAnswers = currentAttempt.answers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Actualizar el intento
    const completedAttempt: QuizAttempt = {
      ...currentAttempt,
      completed: true,
      endTime: new Date(),
      score
    };
    
    // Crear resultado del quiz
    const quizResult: QuizResult = {
      id: `result-${Date.now()}`,
      quizId: quiz.id,
      userId: completedAttempt.userId,
      score,
      totalQuestions,
      date: new Date()
    };
    
    // En una aplicación real, esto llamaría a una API
    // return this.http.put<QuizResult>(`${this.apiUrl}/attempts/${currentAttempt.id}/complete`, completedAttempt)
    
    // Actualizar el BehaviorSubject
    this.currentAttemptSubject.next(completedAttempt);
    
    // Simulate API delay
    return of(quizResult).pipe(
      delay(1000),
      tap(() => {
        // Limpiar el intento actual después de completarlo
        setTimeout(() => this.currentAttemptSubject.next(null), 5000);
      }),
      catchError(error => {
        console.error('Error al completar intento', error);
        return throwError(() => new Error('No se pudo completar el quiz. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene los intentos de un usuario para un tipo de quiz específico
   */
  getUserAttempts(userId: string, quizType?: string): Observable<QuizAttempt[]> {
    // En una aplicación real, esto llamaría a una API
    // let url = `${this.apiUrl}/attempts?userId=${userId}`;
    // if (quizType) {
    //   url += `&quizType=${quizType}`;
    // }
    // return this.http.get<QuizAttempt[]>(url)
    
    // Mock para desarrollo
    const mockAttempts: QuizAttempt[] = [
      {
        id: 'attempt-1',
        userId,
        quizId: 'grammar-b1-1',
        startTime: new Date('2025-05-20T10:00:00'),
        endTime: new Date('2025-05-20T10:15:00'),
        completed: true,
        answers: [
          { questionId: 1, selectedAnswer: 'plays', isCorrect: true, timeSpent: 25 },
          { questionId: 2, selectedAnswer: 'b', isCorrect: true, timeSpent: 40 },
          { questionId: 3, selectedAnswer: 'rains', isCorrect: true, timeSpent: 30 }
        ],
        score: 100,
        totalQuestions: 3
      },
      {
        id: 'attempt-2',
        userId,
        quizId: 'vocabulary-b1-1',
        startTime: new Date('2025-05-21T14:00:00'),
        endTime: new Date('2025-05-21T14:12:00'),
        completed: true,
        answers: [
          { questionId: 1, selectedAnswer: 'huge', isCorrect: true, timeSpent: 20 },
          { questionId: 2, selectedAnswer: 'hint', isCorrect: false, timeSpent: 35 },
          { questionId: 3, selectedAnswer: 'stingy', isCorrect: true, timeSpent: 25 }
        ],
        score: 67,
        totalQuestions: 3
      },
      {
        id: 'attempt-3',
        userId,
        quizId: 'reading-b2-1',
        startTime: new Date('2025-05-22T16:00:00'),
        endTime: new Date('2025-05-22T16:10:00'),
        completed: true,
        answers: [
          { questionId: 1, selectedAnswer: 'b', isCorrect: true, timeSpent: 45 },
          { questionId: 2, selectedAnswer: 'c', isCorrect: true, timeSpent: 50 }
        ],
        score: 100,
        totalQuestions: 2
      }
    ];
    
    // Filtrar por tipo de quiz si se especifica
    let filteredAttempts = mockAttempts;
    if (quizType) {
      filteredAttempts = mockAttempts.filter(attempt => {
        return attempt.quizId.startsWith(quizType);
      });
    }
    
    // Simulate API delay
    return of(filteredAttempts).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener intentos', error);
        return throwError(() => new Error('No se pudieron cargar los intentos. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene un resumen de los intentos de un usuario
   */
  getAttemptSummary(userId: string): Observable<AttemptSummary> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<AttemptSummary>(`${this.apiUrl}/attempts/summary?userId=${userId}`)
    
    // Mock para desarrollo
    const mockSummary: AttemptSummary = {
      totalAttempts: 15,
      averageScore: 78,
      bestScore: 100,
      lastAttemptDate: new Date('2025-05-22T16:10:00'),
      completionRate: 93, // 93% de intentos completados
      timeSpent: 180 // 180 minutos en total
    };
    
    // Simulate API delay
    return of(mockSummary).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener resumen de intentos', error);
        return throwError(() => new Error('No se pudo cargar el resumen. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene análisis de preguntas para un usuario
   */
  getQuestionAnalysis(userId: string, quizType?: string): Observable<QuestionAnalysis[]> {
    // En una aplicación real, esto llamaría a una API
    // let url = `${this.apiUrl}/questions/analysis?userId=${userId}`;
    // if (quizType) {
    //   url += `&quizType=${quizType}`;
    // }
    // return this.http.get<QuestionAnalysis[]>(url)
    
    // Mock para desarrollo
    const mockAnalysis: QuestionAnalysis[] = [
      {
        questionId: 1,
        correctAttempts: 8,
        totalAttempts: 10,
        averageTimeSpent: 28,
        difficultyRating: 'easy'
      },
      {
        questionId: 2,
        correctAttempts: 6,
        totalAttempts: 10,
        averageTimeSpent: 42,
        difficultyRating: 'medium'
      },
      {
        questionId: 3,
        correctAttempts: 4,
        totalAttempts: 10,
        averageTimeSpent: 55,
        difficultyRating: 'hard'
      }
    ];
    
    // Simulate API delay
    return of(mockAnalysis).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener análisis de preguntas', error);
        return throwError(() => new Error('No se pudo cargar el análisis. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene un quiz por ID
   */
  getQuizById(quizId: string): Observable<Quiz> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<Quiz>(`${this.apiUrl}/quizzes/${quizId}`)
    
    // Mock para desarrollo - simplemente devolvemos el quiz actual si coincide el ID
    const currentQuiz = this.currentQuizSubject.value;
    if (currentQuiz && currentQuiz.id === quizId) {
      return of(currentQuiz).pipe(delay(500));
    }
    
    // Si no coincide, creamos un quiz mock
    const mockQuiz: Quiz = {
      id: quizId,
      type: 'grammar',
      level: 'b1',
      questions: this.grammarQuestions
    };
    
    // Simulate API delay
    return of(mockQuiz).pipe(
      delay(1000),
      tap(quiz => this.currentQuizSubject.next(quiz)),
      catchError(error => {
        console.error('Error al obtener quiz por ID', error);
        return throwError(() => new Error('No se pudo cargar el quiz. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene un intento por ID
   */
  getAttemptById(attemptId: string): Observable<QuizAttempt> {
    // En una aplicación real, esto llamaría a una API
    // return this.http.get<QuizAttempt>(`${this.apiUrl}/attempts/${attemptId}`)
    
    // Mock para desarrollo - simplemente devolvemos el intento actual si coincide el ID
    const currentAttempt = this.currentAttemptSubject.value;
    if (currentAttempt && currentAttempt.id === attemptId) {
      return of(currentAttempt).pipe(delay(500));
    }
    
    // Si no coincide, creamos un intento mock
    const mockAttempt: QuizAttempt = {
      id: attemptId,
      userId: this.authService.currentUser?.id || '1',
      quizId: 'grammar-b1-1',
      startTime: new Date('2025-05-20T10:00:00'),
      endTime: new Date('2025-05-20T10:15:00'),
      completed: true,
      answers: [
        { questionId: 1, selectedAnswer: 'plays', isCorrect: true, timeSpent: 25 },
        { questionId: 2, selectedAnswer: 'b', isCorrect: true, timeSpent: 40 },
        { questionId: 3, selectedAnswer: 'rains', isCorrect: true, timeSpent: 30 }
      ],
      score: 100,
      totalQuestions: 3
    };
    
    // Simulate API delay
    return of(mockAttempt).pipe(
      delay(1000),
      catchError(error => {
        console.error('Error al obtener intento por ID', error);
        return throwError(() => new Error('No se pudo cargar el intento. Por favor, intente nuevamente.'));
      })
    );
  }

  /**
   * Verifica una respuesta
   */
  checkAnswer(questionId: number, selectedAnswer: string): boolean {
    const quiz = this.currentQuizSubject.value;
    if (!quiz) {
      return false;
    }
    
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      return false;
    }
    
    return question.correctAnswer === selectedAnswer;
  }

  /**
   * Obtiene el quiz actual
   */
  get currentQuiz(): Quiz | null {
    return this.currentQuizSubject.value;
  }

  /**
   * Obtiene el intento actual
   */
  get currentAttempt(): QuizAttempt | null {
    return this.currentAttemptSubject.value;
  }
}
