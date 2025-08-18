import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { 
  AIQuizRequest, 
  AIQuizResponse, 
  AIGeneratedQuestion, 
  AIFeedbackRequest, 
  AIFeedbackResponse,
  UserPerformanceData 
} from '../models/ai-quiz.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AIQuizService {
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly MODEL = 'gpt-3.5-turbo';
  
  // Cache para evitar llamadas repetitivas
  private questionCache = new Map<string, AIGeneratedQuestion[]>();
  
  // BehaviorSubject para el estado de carga
  private isGeneratingSubject = new BehaviorSubject<boolean>(false);
  public isGenerating$ = this.isGeneratingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Genera un quiz personalizado usando IA
   */
  generateQuiz(request: AIQuizRequest): Observable<AIQuizResponse> {
    // Verificar si tenemos la API key configurada
    if (!environment.openaiApiKey) {
      console.warn('OpenAI API key no configurada, usando datos mock');
      return this.generateMockQuiz(request);
    }

    // Verificar cache primero
    const cacheKey = this.getCacheKey(request);
    if (this.questionCache.has(cacheKey)) {
      const cachedQuestions = this.questionCache.get(cacheKey)!;
      return of({
        questions: cachedQuestions,
        metadata: {
          level: request.level,
          type: request.type,
          difficulty: request.difficulty,
          estimatedTime: cachedQuestions.length * 2,
          topics: cachedQuestions.map(q => q.topic)
        }
      }).pipe(delay(500));
    }

    this.isGeneratingSubject.next(true);

    const prompt = this.buildQuizPrompt(request);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });

    const body = {
      model: this.MODEL,
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en enseñanza de inglés y creación de exámenes estilo Cambridge. Generas preguntas de alta calidad adaptadas al nivel del estudiante.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    return this.http.post<any>(this.OPENAI_API_URL, body, { headers }).pipe(
      map(response => this.parseAIResponse(response, request)),
      tap(quizResponse => {
        // Guardar en cache
        this.questionCache.set(cacheKey, quizResponse.questions);
        this.isGeneratingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error generando quiz con IA:', error);
        this.isGeneratingSubject.next(false);
        // Fallback a datos mock en caso de error
        return this.generateMockQuiz(request);
      })
    );
  }

  /**
   * Genera feedback personalizado para una respuesta usando IA
   */
  generateFeedback(request: AIFeedbackRequest): Observable<AIFeedbackResponse> {
    if (!environment.openaiApiKey) {
      return this.generateMockFeedback(request);
    }

    const prompt = this.buildFeedbackPrompt(request);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });

    const body = {
      model: this.MODEL,
      messages: [
        {
          role: 'system',
          content: 'Eres un tutor de inglés experto. Proporciona feedback constructivo y educativo para ayudar al estudiante a mejorar.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    };

    return this.http.post<any>(this.OPENAI_API_URL, body, { headers }).pipe(
      map(response => this.parseAIFeedback(response, request)),
      catchError(error => {
        console.error('Error generando feedback con IA:', error);
        return this.generateMockFeedback(request);
      })
    );
  }

  /**
   * Analiza el rendimiento del usuario y sugiere el próximo quiz
   */
  getNextQuizRecommendation(performanceData: UserPerformanceData): Observable<AIQuizRequest> {
    // Lógica para determinar el próximo quiz basado en el rendimiento
    const recommendation: AIQuizRequest = {
      level: performanceData.level as any,
      type: this.getWeakestArea(performanceData),
      difficulty: this.adjustDifficulty(performanceData),
      numberOfQuestions: 5,
      userWeaknesses: performanceData.weaknesses,
      previousTopics: performanceData.recentTopics
    };

    return of(recommendation).pipe(delay(300));
  }

  /**
   * Construye el prompt para generar un quiz
   */
  private buildQuizPrompt(request: AIQuizRequest): string {
    const weaknessesText = request.userWeaknesses?.length 
      ? `El usuario tiene dificultades con: ${request.userWeaknesses.join(', ')}.`
      : '';
    
    const previousTopicsText = request.previousTopics?.length
      ? `Evita estos temas ya cubiertos: ${request.previousTopics.join(', ')}.`
      : '';

    return `
Genera ${request.numberOfQuestions} preguntas de inglés con las siguientes especificaciones:
- Nivel: ${request.level} (Marco Común Europeo)
- Tipo: ${request.type}
- Dificultad: ${request.difficulty}
${weaknessesText}
${previousTopicsText}

Formato de respuesta JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "type": "${request.type}",
      "level": "${request.level}",
      "topic": "tema_específico",
      "question": "pregunta_aquí",
      "options": [
        {"id": "a", "text": "opción_a"},
        {"id": "b", "text": "opción_b"},
        {"id": "c", "text": "opción_c"},
        {"id": "d", "text": "opción_d"}
      ],
      "correctAnswer": "id_respuesta_correcta",
      "explanation": "explicación_detallada",
      "difficulty": "${request.difficulty}",
      "estimatedTime": tiempo_en_segundos
    }
  ]
}

Asegúrate de que las preguntas sean variadas, educativas y apropiadas para el nivel especificado.
    `.trim();
  }

  /**
   * Construye el prompt para generar feedback
   */
  private buildFeedbackPrompt(request: AIFeedbackRequest): string {
    return `
Analiza esta respuesta de un estudiante de inglés nivel ${request.level}:

Pregunta: ${request.question}
Respuesta del usuario: ${request.userAnswer}
Respuesta correcta: ${request.correctAnswer}
Tipo de ejercicio: ${request.type}

Proporciona feedback en formato JSON:
{
  "isCorrect": boolean,
  "explanation": "explicación_clara_y_educativa",
  "tips": ["consejo_1", "consejo_2", "consejo_3"],
  "relatedTopics": ["tema_relacionado_1", "tema_relacionado_2"],
  "nextRecommendations": ["recomendación_1", "recomendación_2"]
}

El feedback debe ser constructivo, específico y ayudar al estudiante a mejorar.
    `.trim();
  }

  /**
   * Parsea la respuesta de la IA para el quiz
   */
  private parseAIResponse(response: any, request: AIQuizRequest): AIQuizResponse {
    try {
      const content = response.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      
      return {
        questions: parsedContent.questions.map((q: any, index: number) => ({
          ...q,
          id: q.id || `ai_${Date.now()}_${index}`
        })),
        metadata: {
          level: request.level,
          type: request.type,
          difficulty: request.difficulty,
          estimatedTime: parsedContent.questions.length * 2,
          topics: parsedContent.questions.map((q: any) => q.topic)
        }
      };
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      throw new Error('Error procesando la respuesta de IA');
    }
  }

  /**
   * Parsea la respuesta de la IA para el feedback
   */
  private parseAIFeedback(response: any, request: AIFeedbackRequest): AIFeedbackResponse {
    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parseando feedback de IA:', error);
      return this.generateMockFeedback(request).pipe(
        map(feedback => feedback)
      ).toPromise() as any;
    }
  }

  /**
   * Genera un quiz mock para desarrollo/fallback
   */
  private generateMockQuiz(request: AIQuizRequest): Observable<AIQuizResponse> {
    const mockQuestions: AIGeneratedQuestion[] = [
      {
        id: `mock_${Date.now()}_1`,
        type: request.type,
        level: request.level,
        topic: 'Present Perfect vs Past Simple',
        question: 'Choose the correct option: "I _____ to London three times this year."',
        options: [
          { id: 'a', text: 'went' },
          { id: 'b', text: 'have been' },
          { id: 'c', text: 'was going' },
          { id: 'd', text: 'go' }
        ],
        correctAnswer: 'b',
        explanation: 'We use Present Perfect for experiences up to now. "This year" indicates a time period that continues to the present.',
        difficulty: request.difficulty,
        estimatedTime: 45
      },
      {
        id: `mock_${Date.now()}_2`,
        type: request.type,
        level: request.level,
        topic: 'Conditional Sentences',
        question: 'Complete the sentence: "If I _____ more time, I would learn a new language."',
        options: [
          { id: 'a', text: 'have' },
          { id: 'b', text: 'had' },
          { id: 'c', text: 'will have' },
          { id: 'd', text: 'would have' }
        ],
        correctAnswer: 'b',
        explanation: 'This is a second conditional sentence (hypothetical situation). We use "if + past simple" in the condition clause.',
        difficulty: request.difficulty,
        estimatedTime: 50
      }
    ];

    return of({
      questions: mockQuestions.slice(0, request.numberOfQuestions),
      metadata: {
        level: request.level,
        type: request.type,
        difficulty: request.difficulty,
        estimatedTime: request.numberOfQuestions * 2,
        topics: mockQuestions.map(q => q.topic)
      }
    }).pipe(delay(1500)); // Simular tiempo de generación
  }

  /**
   * Genera feedback mock para desarrollo/fallback
   */
  private generateMockFeedback(request: AIFeedbackRequest): Observable<AIFeedbackResponse> {
    const isCorrect = request.userAnswer.toLowerCase() === request.correctAnswer.toLowerCase();
    
    return of({
      isCorrect,
      explanation: isCorrect 
        ? 'Correct! You have a good understanding of this grammar point.'
        : 'Not quite right. This is a common mistake, but with practice you\'ll master it.',
      tips: [
        'Review the grammar rules for this topic',
        'Practice with similar exercises',
        'Pay attention to context clues'
      ],
      relatedTopics: ['Grammar basics', 'Sentence structure', 'Common mistakes'],
      nextRecommendations: [
        'Practice more exercises of this type',
        'Review related grammar points',
        'Take a diagnostic test'
      ]
    }).pipe(delay(800));
  }

  /**
   * Genera clave de cache para las preguntas
   */
  private getCacheKey(request: AIQuizRequest): string {
    return `${request.level}_${request.type}_${request.difficulty}_${request.numberOfQuestions}`;
  }

  /**
   * Determina el área más débil del usuario
   */
  private getWeakestArea(performanceData: UserPerformanceData): 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking' {
    if (performanceData.weaknesses.length > 0) {
      const weaknessMap: { [key: string]: any } = {
        'grammar': 'grammar',
        'vocabulary': 'vocabulary',
        'reading': 'reading',
        'listening': 'listening',
        'writing': 'writing',
        'speaking': 'speaking'
      };
      
      for (const weakness of performanceData.weaknesses) {
        if (weaknessMap[weakness.toLowerCase()]) {
          return weaknessMap[weakness.toLowerCase()];
        }
      }
    }
    
    return 'grammar'; // Default
  }

  /**
   * Ajusta la dificultad basada en el rendimiento
   */
  private adjustDifficulty(performanceData: UserPerformanceData): 'easy' | 'medium' | 'hard' {
    if (performanceData.averageScore >= 80) {
      return 'hard';
    } else if (performanceData.averageScore >= 60) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  /**
   * Limpia la cache de preguntas
   */
  clearCache(): void {
    this.questionCache.clear();
  }

  /**
   * Obtiene el estado de generación actual
   */
  get isGenerating(): boolean {
    return this.isGeneratingSubject.value;
  }
}