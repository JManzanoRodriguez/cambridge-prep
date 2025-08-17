import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

@Component({
  selector: 'app-quiz-card',
  templateUrl: './quiz-card.component.html',
  styleUrls: ['./quiz-card.component.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
  standalone: true,
})
export class QuizCardComponent {
  @Input() question!: QuizQuestion;
  @Input() isAnswerSubmitted: boolean = false;
  @Input() selectedAnswer: string | null = null;
  @Output() selectAnswer = new EventEmitter<string>();
  @Output() submitAnswer = new EventEmitter<void>();
  @Output() nextQuestion = new EventEmitter<void>();

  constructor() { }

  onSelectAnswer(answerId: string) {
    if (!this.isAnswerSubmitted) {
      this.selectAnswer.emit(answerId);
    }
  }

  onSubmitAnswer() {
    this.submitAnswer.emit();
  }

  onNextQuestion() {
    this.nextQuestion.emit();
  }

  getOptionClass(option: QuizOption): string {
    if (!this.isAnswerSubmitted) {
      return this.selectedAnswer === option.id ? 'selected' : '';
    } else {
      if (option.id === this.question.correctAnswer) {
        return 'correct';
      } else if (this.selectedAnswer === option.id && option.id !== this.question.correctAnswer) {
        return 'incorrect';
      }
      return '';
    }
  }
}
