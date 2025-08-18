
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

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
  quizForm: FormGroup = this.formBuilder.group({
    quizType: ['grammar', Validators.required],
    difficulty: ['medium', Validators.required],
    numberOfQuestions: [10, [Validators.required, Validators.min(5), Validators.max(20)]]
  });
  quizStarted = false;
  quizCompleted = false;
  currentStep = 0;
  totalSteps = 0;
  score = 0;
  isGenerating = false;
  
  // Preguntas generadas por IA
  aiQuestions: AIGeneratedQuestion[] = [];
  currentAIQuestion: AIGeneratedQuestion | null = null;
  
  // Suscripciones
  private subscriptions: Subscription[] = [];
  
  quizTypes = [
    { id: 'grammar', name: 'Grammar', icon: 'book' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'text' },
    { id: 'reading', name: 'Reading Comprehension', icon: 'document-text' },
    { id: 'listening', name: 'Listening', icon: 'headset' }
  ];
  
  difficultyLevels = [
    { id: 'a1', name: 'A1 - Beginner' },
    { id: 'a2', name: 'A2 - Elementary' },
    { id: 'b1', name: 'B1 - Intermediate' },
    { id: 'b2', name: 'B2 - Upper Intermediate' },
    { id: 'c1', name: 'C1 - Advanced' },
    { id: 'c2', name: 'C2 - Proficiency' }
  ];
  
  // Preguntas mock (fallback)
  mockQuestions: any[] = [];
  
  grammarQuestions = [
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
  
  vocabularyQuestions = [
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private aiQuizService: AIQuizService,
    private authService: AuthService
  ) {
    this.quizForm = this.formBuilder.group({
      quizType: ['grammar', Validators.required],
      difficultyLevel: ['b1', Validators.required],
      numberOfQuestions: [10, [Validators.required, Validators.min(5), Validators.max(20)]]
    });
    
    // Suscribirse al estado de generación de IA
    const generatingSub = this.aiQuizService.isGenerating$.subscribe(
      isGenerating => this.isGenerating = isGenerating
    );
    this.subscriptions.push(generatingSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  startQuiz() {
    if (this.quizForm.valid) {
      this.generateAIQuiz();
    }
  }

  /**
   * Genera un quiz usando IA
   */
  private generateAIQuiz() {
    const formValues = this.quizForm.value;
    
    // Obtener datos del usuario para personalización
    const user = this.authService.currentUser;
    
    const aiRequest: AIQuizRequest = {
      level: formValues.difficultyLevel.toUpperCase(),
      type: formValues.quizType,
      difficulty: 'medium', // Podríamos hacer esto más dinámico
      numberOfQuestions: formValues.numberOfQuestions,
      userWeaknesses: [], // TODO: Obtener de las estadísticas del usuario
      previousTopics: [] // TODO: Obtener del historial del usuario
    };

    const aiSub = this.aiQuizService.generateQuiz(aiRequest).subscribe({
      next: (response: AIQuizResponse) => {
        this.aiQuestions = response.questions;
        this.startAIQuiz();
      },
      error: (error) => {
        console.error('Error generando quiz con IA:', error);
        // Fallback a preguntas mock
        this.startMockQuiz();
      }
    });
    
    this.subscriptions.push(aiSub);
  }

  /**
   * Inicia el quiz con preguntas generadas por IA
   */
  private startAIQuiz() {
    this.quizStarted = true;
    this.totalSteps = this.aiQuestions.length;
    this.currentStep = 0;
    this.currentAIQuestion = this.aiQuestions[0];
    
    // Crear controles de formulario para cada pregunta
    this.aiQuestions.forEach((question, index) => {
      this.quizForm.addControl(`aiQuestion${index}`, this.formBuilder.control('', Validators.required));
    });
  }

  /**
   * Inicia el quiz con preguntas mock (fallback)
   */
  private startMockQuiz() {
    this.quizStarted = true;
    
    // Seleccionar preguntas basadas en el tipo de quiz
    const quizType = this.quizForm.get('quizType')?.value;
    if (quizType === 'grammar') {
      this.mockQuestions = this.grammarQuestions;
    } else if (quizType === 'vocabulary') {
      this.mockQuestions = this.vocabularyQuestions;
    } else {
      this.mockQuestions = this.grammarQuestions;
    }
    
    this.totalSteps = this.mockQuestions.length;
    
    // Agregar controles de formulario para cada pregunta
    this.mockQuestions.forEach(question => {
      this.quizForm.addControl(`question${question.id}`, this.formBuilder.control('', Validators.required));
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      if (this.aiQuestions.length > 0) {
        this.currentAIQuestion = this.aiQuestions[this.currentStep];
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      if (this.aiQuestions.length > 0) {
        this.currentAIQuestion = this.aiQuestions[this.currentStep];
      }
    }
  }

  submitQuiz() {
    if (this.quizForm.valid) {
      if (this.aiQuestions.length > 0) {
        this.calculateAIScore();
      } else {
        this.calculateMockScore();
      }
      
      this.quizCompleted = true;
    }
  }

  /**
   * Calcula la puntuación para preguntas de IA
   */
  private calculateAIScore() {
    this.score = 0;
    this.aiQuestions.forEach((question, index) => {
      const control = this.quizForm.get(`aiQuestion${index}`);
      if (control && control.value === question.correctAnswer) {
        this.score++;
      }
    });
  }

  /**
   * Calcula la puntuación para preguntas mock
   */
  private calculateMockScore() {
    this.score = 0;
    this.mockQuestions.forEach(question => {
      const control = this.quizForm.get(`question${question.id}`);
      if (control && control.value === question.correctAnswer) {
        this.score++;
      }
    });
  }

  restartQuiz() {
    this.quizStarted = false;
    this.quizCompleted = false;
    this.currentStep = 0;
    this.score = 0;
    this.aiQuestions = [];
    this.currentAIQuestion = null;
    this.mockQuestions = [];
    
    // Reset form
    this.quizForm = this.formBuilder.group({
      quizType: ['grammar', Validators.required],
      difficultyLevel: ['b1', Validators.required],
      numberOfQuestions: [10, [Validators.required, Validators.min(5), Validators.max(20)]]
    });
  }

  get progressPercentage() {
    return this.totalSteps > 0 ? ((this.currentStep + 1) / this.totalSteps) * 100 : 0;
  }
  
  get scorePercentage() {
    return this.totalSteps > 0 ? (this.score / this.totalSteps) * 100 : 0;
  }

  /**
   * Obtiene la pregunta actual (IA o mock)
   */
  get currentQuestion() {
    if (this.aiQuestions.length > 0) {
      return this.currentAIQuestion;
    } else if (this.mockQuestions.length > 0) {
      return this.mockQuestions[this.currentStep];
    }
    return null;
  }

  /**
   * Obtiene el nombre del control de formulario para la pregunta actual
   */
  get currentQuestionControlName() {
    if (this.aiQuestions.length > 0) {
      return `aiQuestion${this.currentStep}`;
    } else if (this.mockQuestions.length > 0) {
      return `question${this.mockQuestions[this.currentStep]?.id}`;
    }
    return '';
  }

  /**
   * Verifica si la pregunta actual está respondida
   */
  get isCurrentQuestionAnswered() {
    const controlName = this.currentQuestionControlName;
    const control = this.quizForm.get(controlName);
    return control && control.valid;
  }
}
