
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.page.html',
  styleUrls: ['./diagnostic.page.scss'],
  standalone: true,
  imports: [
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
  questions = [
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
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

  submitDiagnostic() {
    if (this.diagnosticForm.valid) {
      // Calculate score
      let score = 0;
      this.questions.forEach(question => {
        const control = this.diagnosticForm.get(`question${question.id}`);
        if (control && control.value === question.correctAnswer) {
          score++;
        }
      });
      
      // Navigate to results with score
      this.router.navigate(['/stats'], { 
        queryParams: { 
          diagnosticScore: score,
          totalQuestions: this.totalSteps
        } 
      });
    }
  }

  get progressPercentage() {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }
}
