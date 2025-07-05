export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  answers: {
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent?: number; // tiempo en segundos
  }[];
  score?: number;
  totalQuestions: number;
}

export interface AttemptSummary {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate: Date;
  completionRate: number; // porcentaje de intentos completados
  timeSpent: number; // tiempo total en minutos
}

export interface QuestionAnalysis {
  questionId: number;
  correctAttempts: number;
  totalAttempts: number;
  averageTimeSpent: number; // tiempo promedio en segundos
  difficultyRating: 'easy' | 'medium' | 'hard';
}
