
export interface User {
  id: string;
  name: string;
  email: string;
  language?: string;
  notificationsEnabled?: boolean;
  profilePicture?: string;
  role: 'student' | 'teacher' | 'admin';
  subscription?: {
    type: 'free' | 'basic' | 'premium';
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    studyReminders: boolean;
    studyGoal?: number; // minutos por día
    weeklyGoal?: number; // días por semana
  };
}
