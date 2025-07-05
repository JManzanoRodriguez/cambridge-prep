
export interface SkillAssessment {
  grammar: number;
  vocabulary: number;
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  [key: string]: number;
}

export interface ProgressPoint {
  date: Date;
  score: number;
}

export interface UserStats {
  userId: string;
  skillAssessment: SkillAssessment;
  progressHistory: ProgressPoint[];
  quizPerformance: {
    [key: string]: number; // category: average score
  };
}

export interface Recommendation {
  skill: string;
  topic: string;
  difficulty: string;
}
