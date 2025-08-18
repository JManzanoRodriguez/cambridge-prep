
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.page.html',
  styleUrls: ['./diagnostic.page.scss'],
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
    MatStepperModule,
    MatIconModule
  ]
})
export class DiagnosticPage {
  diagnosticForm: FormGroup = this.formBuilder.group({});
  currentStep = 0;
  totalSteps = 5;
  isLoading = false;
  isCompleted = false;
  finalScore = 0;
  determinedLevel = '';

  questions = [
    {
      id: 1,
      level: 'A1',
      skill: 'grammar',
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
      level: 'A2',
      skill: 'grammar',
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
      level: 'B1',
      skill: 'vocabulary',
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
      level: 'B1',
      skill: 'grammar',
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
      level: 'B2',
      skill: 'grammar',
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    this.diagnosticForm = this.formBuilder.group({});
    this.questions.forEach(question => {
      this.diagnosticForm.addControl(`question${question.id}`, this.formBuilder.control('', Validators.required));
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Obtener valor de la pregunta actual
  getQuestionValue(stepIndex: number): string {
    const question = this.questions[stepIndex];
    const controlName = `question${question.id}`;
    return this.diagnosticForm.get(controlName)?.value || '';
  }

  // Manejar cambio de respuesta
  onAnswerChange(event: any, stepIndex: number) {
    const question = this.questions[stepIndex];
    const controlName = `question${question.id}`;
    const selectedValue = event.value;
    
    console.log('🎯 Respuesta seleccionada:', {
      pregunta: question.id,
      control: controlName,
      valor: selectedValue
    });
    
    // Actualizar el FormControl
    this.diagnosticForm.get(controlName)?.setValue(selectedValue);
    
    // Verificar que se actualizó
    const updatedValue = this.diagnosticForm.get(controlName)?.value;
    console.log('✅ Valor actualizado:', updatedValue);
  }

  // Verificar si la pregunta actual está respondida
  isCurrentQuestionAnswered(): boolean {
    const currentQuestion = this.questions[this.currentStep];
    const controlName = `question${currentQuestion.id}`;
    const control = this.diagnosticForm.get(controlName);
    const hasValue = control?.value && control.value !== '';

    if (hasValue) {
      console.log('🟢 Botón habilitado - Pregunta:', controlName, 'Valor:', control?.value);
    } else {
      console.log('🔴 Botón deshabilitado - Pregunta:', controlName, 'Valor:', control?.value);
    }

    return hasValue;
  }

  async submitDiagnostic() {
    if (this.diagnosticForm.valid) {
      this.isLoading = true;

      // Calcular puntuación y nivel
      const results = this.calculateResults();
      this.finalScore = results.score;
      this.determinedLevel = results.level;

      // Guardar en base de datos
      await this.saveDiagnosticResults(results);

      // Actualizar perfil del usuario
      await this.updateUserLevel(results.level);

      this.isCompleted = true;
      this.isLoading = false;

      await this.presentToast(`¡Test completado! Tu nivel es ${results.level}`, 'success');
    }
  }

  private calculateResults() {
    let score = 0;
    const skillScores: { [key: string]: { correct: number; total: number } } = {};

    this.questions.forEach(question => {
      const control = this.diagnosticForm.get(`question${question.id}`);
      const isCorrect = control && control.value === question.correctAnswer;

      if (isCorrect) {
          score++;
        }

      // Agrupar por habilidad
      if (!skillScores[question.skill]) {
        skillScores[question.skill] = { correct: 0, total: 0 };
      }
      skillScores[question.skill].total++;
      if (isCorrect) {
        skillScores[question.skill].correct++;
      }
    });

    // Determinar nivel basado en puntuación
    const percentage = (score / this.totalSteps) * 100;
    let level = 'A1';

    if (percentage >= 90) level = 'C2';
    else if (percentage >= 80) level = 'C1';
    else if (percentage >= 70) level = 'B2';
    else if (percentage >= 60) level = 'B1';
    else if (percentage >= 40) level = 'A2';
    else level = 'A1';

    return {
      score,
      percentage,
      level,
      skillScores,
      answers: this.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: this.diagnosticForm.get(`question${q.id}`)?.value,
        correctAnswer: q.correctAnswer,
        isCorrect: this.diagnosticForm.get(`question${q.id}`)?.value === q.correctAnswer,
        skill: q.skill,
        level: q.level
      }))
    };
  }

  private async saveDiagnosticResults(results: any) {
    const user = this.authService.currentUser;
    if (!user) return;

    try {
      const { error } = await this.supabaseService.saveQuizResult({
        user_id: user.id,
        type: 'diagnostic',
        level: results.level,
        questions: this.questions,
        score: results.score,
        total_questions: this.totalSteps,
        completed_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error guardando resultados:', error);
      }
    } catch (error) {
      console.error('Error guardando resultados:', error);
    }
  }

  private async updateUserLevel(level: string) {
    const user = this.authService.currentUser;
    if (!user) return;

    try {
      const { error } = await this.supabaseService.updateUserProfile(user.id, {
        level: level
      });

      if (error) {
        console.error('Error actualizando nivel:', error);
      }
    } catch (error) {
      console.error('Error actualizando nivel:', error);
    }
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

  restartTest() {
    this.currentStep = 0;
    this.isCompleted = false;
    this.finalScore = 0;
    this.determinedLevel = '';

    // Reset form
    this.diagnosticForm = this.formBuilder.group({});
    this.questions.forEach(question => {
      this.diagnosticForm.addControl(`question${question.id}`, this.formBuilder.control('', Validators.required));
    });
  }

  goToStats() {
    this.router.navigate(['/stats']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  get progressPercentage() {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }
}
