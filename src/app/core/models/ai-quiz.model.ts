export interface AIQuizRequest {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking';
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
  userWeaknesses?: string[]; // Áreas donde el usuario necesita mejorar
  previousTopics?: string[]; // Temas ya cubiertos para evitar repetición
}

export interface AIQuizResponse {
  questions: AIGeneratedQuestion[];
  metadata: {
    level: string;
    type: string;
    difficulty: string;
    estimatedTime: number; // en minutos
    topics: string[];
  };
}

export interface AIGeneratedQuestion {
  id: string;
  type: string;
  level: string;
  topic: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // en segundos
}

export interface AIFeedbackRequest {
  userAnswer: string;
  correctAnswer: string;
  question: string;
  level: string;
  type: string;
}

export interface AIFeedbackResponse {
  isCorrect: boolean;
  explanation: string;
  tips: string[];
  relatedTopics: string[];
  nextRecommendations: string[];
}

export interface UserPerformanceData {
  userId: string;
  level: string;
  strengths: string[];
  weaknesses: string[];
  recentTopics: string[];
  averageScore: number;
  preferredDifficulty: 'easy' | 'medium' | 'hard';
}