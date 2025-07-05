
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

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
  
  questions: any[] = [];
  
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
    private router: Router
  ) {
    this.quizForm = this.formBuilder.group({
      quizType: ['grammar', Validators.required],
      difficultyLevel: ['b1', Validators.required],
      numberOfQuestions: [10, [Validators.required, Validators.min(5), Validators.max(20)]]
    });
  }

  startQuiz() {
    if (this.quizForm.valid) {
      this.quizStarted = true;
      
      // Select questions based on quiz type
      const quizType = this.quizForm.get('quizType')?.value;
      if (quizType === 'grammar') {
        this.questions = this.grammarQuestions;
      } else if (quizType === 'vocabulary') {
        this.questions = this.vocabularyQuestions;
      } else {
        // Default to grammar questions for now
        this.questions = this.grammarQuestions;
      }
      
      this.totalSteps = this.questions.length;
      
      // Add form controls for each question
      this.questions.forEach(question => {
        this.quizForm.addControl(`question${question.id}`, this.formBuilder.control('', Validators.required));
      });
    }
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

  submitQuiz() {
    if (this.quizForm.valid) {
      // Calculate score
      this.score = 0;
      this.questions.forEach(question => {
        const control = this.quizForm.get(`question${question.id}`);
        if (control && control.value === question.correctAnswer) {
          this.score++;
        }
      });
      
      this.quizCompleted = true;
    }
  }

  restartQuiz() {
    this.quizStarted = false;
    this.quizCompleted = false;
    this.currentStep = 0;
    this.score = 0;
    
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
}
