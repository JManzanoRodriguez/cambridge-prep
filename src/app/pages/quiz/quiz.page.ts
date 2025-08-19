import { Component, OnDestroy } from '@angular/core';
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

import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

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
    MatTabsModule,
  ],
})
export class QuizPage implements OnDestroy {
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
  currentQuestions: QuizQuestion[] = [];
  currentQuestion: QuizQuestion | null = null;

  // Configuración del quiz
  quizConfig = {
    type: 'grammar',
    level: 'B1',
    numberOfQuestions: 5,
    timeLimit: 300, // 5 minutos en segundos
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
    { id: 'listening', name: 'Listening', icon: 'headset' },
  ];

  difficultyLevels = [
    { id: 'A1', name: 'A1 - Beginner' },
    { id: 'A2', name: 'A2 - Elementary' },
    { id: 'B1', name: 'B1 - Intermediate' },
    { id: 'B2', name: 'B2 - Upper Intermediate' },
    { id: 'C1', name: 'C1 - Advanced' },
    { id: 'C2', name: 'C2 - Proficiency' },
  ];

  // Bancos de preguntas mock por tipo y nivel
  questionBanks: { [key: string]: { [key: string]: QuizQuestion[] } } = {
    grammar: {
      A1: [
        {
          id: 'g_a1_1',
          text: 'Choose the correct form: "I _____ a student."',
          options: [
            { id: 'a', text: 'am' },
            { id: 'b', text: 'is' },
            { id: 'c', text: 'are' },
            { id: 'd', text: 'be' },
          ],
          correctAnswer: 'a',
          explanation: 'With "I", we always use "am" in the present tense of the verb "to be".',
          topic: 'Verb to be',
          difficulty: 'easy',
        },
        {
          id: 'g_a1_2',
          text: 'Complete the sentence: "She _____ tennis every Sunday."',
          options: [
            { id: 'a', text: 'play' },
            { id: 'b', text: 'plays' },
            { id: 'c', text: 'playing' },
            { id: 'd', text: 'is play' },
          ],
          correctAnswer: 'b',
          explanation: 'With third person singular (she/he/it), we add -s to the verb in present simple.',
          topic: 'Present Simple',
          difficulty: 'easy',
        },
        {
          id: 'g_a1_3',
          text: 'Choose the correct article: "I have _____ apple."',
          options: [
            { id: 'a', text: 'a' },
            { id: 'b', text: 'an' },
            { id: 'c', text: 'the' },
            { id: 'd', text: 'no article' },
          ],
          correctAnswer: 'b',
          explanation: 'We use "an" before words that start with a vowel sound.',
          topic: 'Articles',
          difficulty: 'easy',
        },
      ],
      B1: [
        {
          id: 'g_b1_1',
          text: 'Choose the correct conditional: "If it _____ tomorrow, we will cancel the picnic."',
          options: [
            { id: 'a', text: 'rains' },
            { id: 'b', text: 'will rain' },
            { id: 'c', text: 'would rain' },
            { id: 'd', text: 'is raining' },
          ],
          correctAnswer: 'a',
          explanation: 'In first conditional, we use present simple in the if-clause and will + infinitive in the main clause.',
          topic: 'First Conditional',
          difficulty: 'medium',
        },
        {
          id: 'g_b1_2',
          text: 'Select the correct sentence:',
          options: [
            { id: 'a', text: 'I have been working here since three years.' },
            { id: 'b', text: 'I have been working here for three years.' },
            { id: 'c', text: 'I am working here for three years.' },
            { id: 'd', text: 'I work here since three years.' },
          ],
          correctAnswer: 'b',
          explanation:
            'We use "for" with periods of time and "since" with points in time. Present perfect continuous is correct for ongoing actions.',
          topic: 'Present Perfect Continuous',
          difficulty: 'medium',
        },
      ],
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
            { id: 'd', text: 'long' },
          ],
          correctAnswer: 'a',
          explanation: '"Small" is the direct opposite of "big" in terms of size.',
          topic: 'Basic Adjectives',
          difficulty: 'easy',
        },
        {
          id: 'v_a1_2',
          text: 'Choose the correct word: "I _____ breakfast every morning."',
          options: [
            { id: 'a', text: 'make' },
            { id: 'b', text: 'do' },
            { id: 'c', text: 'have' },
            { id: 'd', text: 'take' },
          ],
          correctAnswer: 'c',
          explanation: 'We "have" breakfast, lunch, and dinner. This is a common collocation.',
          topic: 'Daily Routines',
          difficulty: 'easy',
        },
      ],
      B1: [
        {
          id: 'v_b1_1',
          text: 'What is the synonym of "enormous"?',
          options: [
            { id: 'a', text: 'tiny' },
            { id: 'b', text: 'huge' },
            { id: 'c', text: 'beautiful' },
            { id: 'd', text: 'dangerous' },
          ],
          correctAnswer: 'b',
          explanation: '"Huge" and "enormous" both mean extremely large in size.',
          topic: 'Advanced Adjectives',
          difficulty: 'medium',
        },
      ],
    },
    reading: {
      B1: [
        {
          id: 'r_b1_1',
          text: 'According to the passage, what is the main benefit of renewable energy?',
          options: [
            { id: 'a', text: 'It is cheaper than fossil fuels' },
            { id: 'b', text: 'It reduces environmental impact' },
            { id: 'c', text: 'It is easier to produce' },
            { id: 'd', text: 'It requires less maintenance' },
          ],
          correctAnswer: 'b',
          explanation: 'The passage emphasizes that renewable energy helps reduce carbon emissions and environmental damage.',
          topic: 'Environmental Issues',
          difficulty: 'medium',
        },
      ],
    },
    listening: {
      B1: [
        {
          id: 'l_b1_1',
          text: "What is the speaker's main point about digital communication?",
          options: [
            { id: 'a', text: 'It has completely replaced face-to-face interaction' },
            { id: 'b', text: 'It has both benefits and drawbacks for society' },
            { id: 'c', text: 'It should be avoided whenever possible' },
            { id: 'd', text: 'It is primarily beneficial for business purposes' },
          ],
          correctAnswer: 'b',
          explanation: 'The speaker discusses both positive and negative aspects of digital communication.',
          topic: 'Technology and Society',
          difficulty: 'medium',
        },
      ],
    },
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    // Formulario para configurar el quiz
    this.setupForm = this.formBuilder.group({
      quizType: ['grammar', Validators.required],
      level: ['B1', Validators.required],
      numberOfQuestions: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
    });

    // Formulario para las respuestas del quiz
    this.quizForm = this.formBuilder.group({});

    // Cargar configuración desde query params si existe
    this.loadConfigFromParams();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.clearTimer();
  }

  private loadConfigFromParams() {
    const sub = this.route.queryParams.subscribe((params) => {
      if (params['type']) {
        this.setupForm.patchValue({
          quizType: params['type'],
          level: params['level'] || 'B1',
          numberOfQuestions: parseInt(params['questions']) || 5,
        });
      }
    });
    this.subscriptions.push(sub);
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
          timeLimit: config.numberOfQuestions * 60, // 1 minuto por pregunta
        };

        // Generar preguntas
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

    // Obtener preguntas del banco mock
    const availableQuestions = this.questionBanks[type]?.[level] || [];

    if (availableQuestions.length === 0) {
      throw new Error(`No hay preguntas disponibles para ${type} nivel ${level}`);
    }

    // Seleccionar preguntas aleatoriamente
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    this.currentQuestions = shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length));

    // Si no hay suficientes preguntas, repetir algunas
    while (this.currentQuestions.length < numberOfQuestions) {
      const remaining = numberOfQuestions - this.currentQuestions.length;
      const additional = shuffled.slice(0, remaining);
      this.currentQuestions.push(...additional);
    }
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
    this.correctAnswers = 0;

    this.currentQuestions.forEach((question, index) => {
      const control = this.quizForm.get(`question${index}`);
      const selectedAnswer = control?.value;

      if (selectedAnswer === question.correctAnswer) {
        this.correctAnswers++;
      }
    });

    // Convertir a porcentaje
    this.score = Math.round((this.correctAnswers / this.totalSteps) * 100);
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
        difficulty: question.difficulty,
      };
    });

    // Calcular tiempo empleado
    const timeSpent = this.startTime && this.endTime ? Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000) : 0;

    // Guardar en Supabase
    const quizData = {
      user_id: user.id,
      type: this.quizConfig.type,
      level: this.quizConfig.level,
      questions: {
        config: this.quizConfig,
        questions: this.currentQuestions,
        answers: userAnswers,
      },
      score: this.score,
      total_questions: this.totalSteps,
      time_spent: timeSpent,
      completed_at: this.endTime?.toISOString(),
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

      // Encontrar progreso para esta habilidad
      const skillProgress = currentProgress?.find((p) => p.skill_type === this.quizConfig.type);

      let newPercentage = this.score;
      let totalQuestions = this.totalSteps;
      let correctAnswers = this.correctAnswers;

      if (skillProgress) {
        // Actualizar progreso existente (promedio ponderado)
        const existingWeight = 0.7;
        const newWeight = 0.3;
        newPercentage = Math.round(skillProgress.progress_percentage * existingWeight + this.score * newWeight);
        totalQuestions = skillProgress.total_questions_answered + this.totalSteps;
        correctAnswers = skillProgress.correct_answers + this.correctAnswers;
      }

      await this.supabaseService.updateUserProgress({
        user_id: user.id,
        skill_type: this.quizConfig.type,
        current_level: this.quizConfig.level,
        progress_percentage: newPercentage,
        total_questions_answered: totalQuestions,
        correct_answers: correctAnswers,
      });
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
      position: 'top',
    });
    await toast.present();
  }

  // Getters
  get progressPercentage() {
    return this.totalSteps > 0 ? ((this.currentStep + 1) / this.totalSteps) * 100 : 0;
  }

  get timeLeftFormatted() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get currentQuestionControlName() {
    return `question${this.currentStep}`;
  }

  get isCurrentQuestionAnswered() {
    const controlName = this.currentQuestionControlName;
    const control = this.quizForm.get(controlName);
    return control && control.valid && control.value !== '';
  }

  get timerClass() {
    const percentage = (this.timeLeft / this.quizConfig.timeLimit) * 100;
    if (percentage <= 10) return 'danger';
    if (percentage <= 25) return 'warning';
    return 'primary';
  }

  get resultMessage() {
    if (this.score >= 90) return '¡Excelente trabajo!';
    if (this.score >= 80) return '¡Muy bien!';
    if (this.score >= 70) return '¡Buen trabajo!';
    if (this.score >= 60) return 'Bien, sigue practicando';
    return 'Necesitas más práctica';
  }

  get resultColor() {
    if (this.score >= 80) return 'success';
    if (this.score >= 60) return 'primary';
    if (this.score >= 40) return 'warning';
    return 'danger';
  }

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

    const topics = [...new Set(wrongAnswers.map((q) => q.topic))];
    if (topics.length > 0) {
      recs.push(`Revisa estos temas: ${topics.join(', ')}`);
    }

    return recs;
  }

  get quizTypeName(): string {
    const type = this.quizTypes?.find((t) => t.id === this.quizConfig?.type);
    return type?.name ?? '';
  }

  get quizDurationMinutes(): number {
    if (this.startTime && this.endTime) {
      return Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000 / 60);
    }
    return 0;
  }
}
