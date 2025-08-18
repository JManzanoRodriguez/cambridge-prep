
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';

import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

// Importar servicios y modelos de IA
import { AIQuizService } from '../../core/services/ai-quiz.service';
import { AIQuizRequest, AIGeneratedQuestion, AIQuizResponse } from '../../core/models/ai-quiz.model';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { QuizService } from '../../core/services/quiz.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressBarModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule
  ]
})
export class QuizPage {
  // Estados del quiz
  setupForm: FormGroup;
  quizForm: FormGroup;
  quizStarted = false;
  quizCompleted = false;
  isLoading = false;
  isSubmitting = false;
  currentStep = 0;
  totalSteps = 0;
  score = 0;
  correctAnswers = 0;
  startTime: Date | null = null;
  endTime: Date | null = null;
  
  // Preguntas del quiz actual
  currentQuestions: any[] = [];
  currentQuestion: any = null;
  
  // Configuración del quiz
  quizConfig = {
    type: 'grammar',
    level: 'B1',
    numberOfQuestions: 5,
    timeLimit: 300 // 5 minutos en segundos
  };
  
  // Timer
  timeLeft = 0;
  timerInterval: any;
  
  // Suscripciones
  private subscriptions: Subscription[] = [];
  
  quizTypes = [
    { id: 'grammar', name: 'Grammar', icon: 'book' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'text' },
    { id: 'reading', name: 'Reading Comprehension', icon: 'document-text' },
    { id: 'listening', name: 'Listening', icon: 'headset' }
  ];
  
  difficultyLevels = [
    { id: 'A1', name: 'A1 - Beginner' },
    { id: 'A2', name: 'A2 - Elementary' },
    { id: 'B1', name: 'B1 - Intermediate' },
    { id: 'B2', name: 'B2 - Upper Intermediate' },
    { id: 'C1', name: 'C1 - Advanced' },
    { id: 'C2', name: 'C2 - Proficiency' }
  ];
  
  // Bancos de preguntas mock por tipo y nivel
  questionBanks: { [key: string]: { [key: string]: any[] } } = {
    grammar: {
      A1: [
        {
          id: 'g_a1_1',
          text: 'Choose the correct form: "I _____ a student."',
          options: [
            { id: 'a', text: 'am' },
            { id: 'b', text: 'is' },
            { id: 'c', text: 'are' },
            { id: 'd', text: 'be' }
          ],
          correctAnswer: 'a',
          explanation: 'With "I", we always use "am" in the present tense of the verb "to be".',
          topic: 'Verb to be',
          difficulty: 'easy'
        },
        {
          id: 'g_a1_2',
          text: 'Complete the sentence: "She _____ tennis every Sunday."',
          options: [
            { id: 'a', text: 'play' },
            { id: 'b', text: 'plays' },
            { id: 'c', text: 'playing' },
            { id: 'd', text: 'is play' }
          ],
          correctAnswer: 'b',
          explanation: 'With third person singular (she/he/it), we add -s to the verb in present simple.',
          topic: 'Present Simple',
          difficulty: 'easy'
        }
      ],
      B1: [
        {
          id: 'g_b1_1',
          text: 'Choose the correct conditional: "If it _____ tomorrow, we will cancel the picnic."',
          options: [
            { id: 'a', text: 'rains' },
            { id: 'b', text: 'will rain' },
            { id: 'c', text: 'would rain' },
            { id: 'd', text: 'is raining' }
          ],
          correctAnswer: 'a',
          explanation: 'In first conditional, we use present simple in the if-clause and will + infinitive in the main clause.',
          topic: 'First Conditional',
          difficulty: 'medium'
        },
        {
          id: 'g_b1_2',
          text: 'Select the correct sentence:',
          options: [
            { id: 'a', text: 'I have been working here since three years.' },
            { id: 'b', text: 'I have been working here for three years.' },
            { id: 'c', text: 'I am working here for three years.' },
            { id: 'd', text: 'I work here since three years.' }
          ],
          correctAnswer: 'b',
          explanation: 'We use "for" with periods of time and "since" with points in time. Present perfect continuous is correct for ongoing actions.',
          topic: 'Present Perfect Continuous',
          difficulty: 'medium'
        }
      ]
    },
    vocabulary: {
      A1: [
        {
          id: 'v_a1_1',
          text: 'What is the opposite of "big"?',
          options: [
            { id: 'a', text: 'small' },
            { id: 'b', text: 'tall' },
            { id: 'c', text: 'wide' },
            { id: 'd', text: 'long' }
          ],
          correctAnswer: 'a',
          explanation: '"Small" is the direct opposite of "big" in terms of size.',
          topic: 'Basic Adjectives',
          difficulty: 'easy'
        }
      ],
      B1: [
        {
          id: 'v_b1_1',
          text: 'What is the synonym of "enormous"?',
          options: [
            { id: 'a', text: 'tiny' },
            { id: 'b', text: 'huge' },
            { id: 'c', text: 'beautiful' },
            { id: 'd', text: 'dangerous' }
          ],
          correctAnswer: 'b',
          explanation: '"Huge" and "enormous" both mean extremely large in size.',
          topic: 'Advanced Adjectives',
          difficulty: 'medium'
        }
      ]
    }
  };
  

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private quizService: QuizService,
    private aiQuizService: AIQuizService
  ) {
    // Formulario para configurar el quiz
    this.setupForm = this.formBuilder.group({
      quizType: ['grammar', Validators.required],
      level: ['B1', Validators.required],
      numberOfQuestions: [5, [Validators.required, Validators.min(3), Validators.max(10)]]
    });
    
    // Formulario para las respuestas del quiz
    this.quizForm = this.formBuilder.group({});
    
    // Cargar configuración desde query params si existe
    this.loadConfigFromParams();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.clearTimer();
  }

  private loadConfigFromParams() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.setupForm.patchValue({
          quizType: params['type'],
          level: params['level'] || 'B1',
          numberOfQuestions: parseInt(params['questions']) || 5
        });
      }
    });
  }

  async startQuiz() {
    if (this.setupForm.valid) {
      this.isLoading = true;
      
      try {
        // Obtener configuración del formulario
        const config = this.setupForm.value;
        this.quizConfig = {
          type: config.quizType,
          level: config.level,
          numberOfQuestions: config.numberOfQuestions,
          timeLimit: config.numberOfQuestions * 60 // 1 minuto por pregunta
        };
        
        // Generar preguntas (mock por ahora, IA después)
        await this.generateQuestions();
        
        // Inicializar quiz
        this.initializeQuiz();
        
      } catch (error) {
        console.error('Error iniciando quiz:', error);
        await this.presentToast('Error al iniciar el quiz. Inténtalo de nuevo.', 'danger');
      } finally {
        this.isLoading = false;
      }
    }
  }

  /**
   * Genera preguntas para el quiz (mock por ahora, preparado para IA)
   */
  private async generateQuestions() {
    const { type, level, numberOfQuestions } = this.quizConfig;
    
    // TODO: Aquí se integrará la IA después
    // Por ahora usamos el banco de preguntas mock
    const availableQuestions = this.questionBanks[type]?.[level] || [];
    
    if (availableQuestions.length === 0) {
      throw new Error(`No hay preguntas disponibles para ${type} nivel ${level}`);
    }
    
    // Seleccionar preguntas aleatoriamente
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    this.currentQuestions = shuffled.slice(0, numberOfQuestions);
  }

  /**
   * Inicializa el quiz con las preguntas generadas
   */
  private initializeQuiz() {
    this.quizStarted = true;
    this.totalSteps = this.currentQuestions.length;
    this.currentStep = 0;
    this.currentQuestion = this.currentQuestions[0];
    this.startTime = new Date();
    this.score = 0;
    this.correctAnswers = 0;
    
    // Crear controles de formulario para cada pregunta  
    this.quizForm = this.formBuilder.group({});
    this.currentQuestions.forEach((question, index) => {
      this.quizForm.addControl(`question${index}`, this.formBuilder.control('', Validators.required));
    });
    
    // Iniciar timer
    this.startTimer();
  }

  /**
   * Inicia el temporizador
   */
  private startTimer() {
    this.timeLeft = this.quizConfig.timeLimit;
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        this.timeUp();
      }
    }, 1000);
  }
  
  /**
   * Maneja cuando se acaba el tiempo
   */
  private async timeUp() {
    this.clearTimer();
    await this.presentToast('¡Tiempo agotado! Enviando respuestas...', 'warning');
    await this.submitQuiz();
  }
  
  /**
   * Limpia el temporizador
   */
  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.currentQuestion = this.currentQuestions[this.currentStep];
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.currentQuestion = this.currentQuestions[this.currentStep];
    }
  }

  async submitQuiz() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    this.clearTimer();
    this.endTime = new Date();
    
    try {
      // Calcular puntuación
      this.calculateScore();
      
      // Guardar resultados en Supabase
      await this.saveQuizResults();
      
      this.quizCompleted = true;
      await this.presentToast(`¡Quiz completado! Puntuación: ${this.score}%`, 'success');
      
    } catch (error) {
      console.error('Error enviando quiz:', error);
      await this.presentToast('Error al guardar los resultados. Inténtalo de nuevo.', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Calcula la puntuación del quiz
   */
  private calculateScore() {
    this.score = 0;
    this.correctAnswers = 0;
    
    this.currentQuestions.forEach((question, index) => {
      const control = this.quizForm.get(`question${index}`);
      const selectedAnswer = control?.value;
      
      if (selectedAnswer === question.correctAnswer) {
        this.correctAnswers++;
        this.score++;
      }
    });
    
    // Convertir a porcentaje
    this.score = Math.round((this.score / this.totalSteps) * 100);
  }

  /**
   * Guarda los resultados del quiz en Supabase
   */
  private async saveQuizResults() {
    const user = this.authService.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    // Preparar respuestas del usuario
    const userAnswers = this.currentQuestions.map((question, index) => {
      const control = this.quizForm.get(`question${index}`);
      const selectedAnswer = control?.value || '';
      
      return {
        questionId: question.id,
        question: question.text,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
        topic: question.topic,
        difficulty: question.difficulty
      };
    });
    
    // Calcular tiempo empleado
    const timeSpent = this.startTime && this.endTime 
      ? Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000)
      : 0;
    
    // Guardar en Supabase
    const quizData = {
      user_id: user.id,
      type: this.quizConfig.type,
      level: this.quizConfig.level,
      questions: {
        config: this.quizConfig,
        questions: this.currentQuestions,
        answers: userAnswers
      },
      score: this.score,
      total_questions: this.totalSteps,
      time_spent: timeSpent,
      completed_at: this.endTime?.toISOString()
    };
    
    const { error } = await this.supabaseService.saveQuizResult(quizData);
    
    if (error) {
      throw new Error(`Error guardando quiz: ${error.message}`);
    }
    
    // Actualizar progreso del usuario
    await this.updateUserProgress();
  }
  
  /**
   * Actualiza el progreso del usuario basado en los resultados
   */
  private async updateUserProgress() {
    const user = this.authService.currentUser;
    if (!user) return;
    
    try {
      // Obtener progreso actual
      const { data: currentProgress } = await this.supabaseService.getUserProgress(user.id);
      
      // Encontrar o crear progreso para esta habilidad
      const skillProgress = currentProgress?.find(p => p.skill_type === this.quizConfig.type);
      
      if (skillProgress) {
        // Actualizar progreso existente (promedio ponderado)
        const newPercentage = Math.round(
          (skillProgress.progress_percentage * 0.7) + (this.score * 0.3)
        );
        
        await this.supabaseService.updateUserProgress({
          id: skillProgress.id,
          progress_percentage: newPercentage,
          total_questions_answered: skillProgress.total_questions_answered + this.totalSteps,
          correct_answers: skillProgress.correct_answers + this.correctAnswers,
          last_updated: new Date().toISOString()
        });
      } else {
        // Crear nuevo progreso
        await this.supabaseService.updateUserProgress({
          user_id: user.id,
          skill_type: this.quizConfig.type,
          current_level: this.quizConfig.level,
          progress_percentage: this.score,
          total_questions_answered: this.totalSteps,
          correct_answers: this.correctAnswers,
          last_updated: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      // No lanzar error aquí para no interrumpir el flujo
    }
  }

  async restartQuiz() {
    this.clearTimer();
    this.quizStarted = false;
    this.quizCompleted = false;
    this.currentStep = 0;
    this.score = 0;
    this.correctAnswers = 0;
    this.currentQuestions = [];
    this.currentQuestion = null;
    this.startTime = null;
    this.endTime = null;
    this.timeLeft = 0;
    
    // Reset formularios
    this.quizForm = this.formBuilder.group({});
  }
  
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  get progressPercentage() {
    return this.totalSteps > 0 ? ((this.currentStep + 1) / this.totalSteps) * 100 : 0;
  }
  
  get timeLeftFormatted() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Obtiene el nombre del control de formulario para la pregunta actual
   */
  get currentQuestionControlName() {
    return `question${this.currentStep}`;
  }

  /**
   * Verifica si la pregunta actual está respondida
   */
  get isCurrentQuestionAnswered() {
    const controlName = this.currentQuestionControlName;
    const control = this.quizForm.get(controlName);
    return control && control.valid && control.value !== '';
  }

  /**
   * Obtiene la clase CSS para el timer basada en el tiempo restante
   */
  get timerClass() {
    const percentage = (this.timeLeft / this.quizConfig.timeLimit) * 100;
    if (percentage <= 10) return 'danger';
    if (percentage <= 25) return 'warning';
    return 'primary';
  }
  
  /**
   * Obtiene el mensaje de resultado basado en la puntuación
   */
  get resultMessage() {
    if (this.score >= 90) return '¡Excelente trabajo!';
    if (this.score >= 80) return '¡Muy bien!';
    if (this.score >= 70) return '¡Buen trabajo!';
    if (this.score >= 60) return 'Bien, sigue practicando';
    return 'Necesitas más práctica';
  }
  
  /**
   * Obtiene el color del resultado basado en la puntuación
   */
  get resultColor() {
    if (this.score >= 80) return 'success';
    if (this.score >= 60) return 'primary';
    if (this.score >= 40) return 'warning';
    return 'danger';
  }
  
  /**
   * Obtiene recomendaciones basadas en el rendimiento
   */
  get recommendations() {
    const recs = [];
    
    if (this.score < 70) {
      recs.push(`Practica más ejercicios de ${this.quizConfig.type}`);
    }
    
    if (this.score >= 80) {
      recs.push('¡Considera intentar un nivel más alto!');
    }
    
    // Analizar errores por tema
    const wrongAnswers = this.currentQuestions.filter((question, index) => {
      const control = this.quizForm.get(`question${index}`);
      return control?.value !== question.correctAnswer;
    });
    
    const topics = [...new Set(wrongAnswers.map(q => q.topic))];
    if (topics.length > 0) {
      recs.push(`Revisa estos temas: ${topics.join(', ')}`);
    }
    
    return recs;
  }
}
