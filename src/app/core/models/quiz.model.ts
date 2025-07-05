
export interface QuizOption {
  value: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  type: 'grammar' | 'vocabulary' | 'reading' | 'listening';
  level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  date: Date;
}
