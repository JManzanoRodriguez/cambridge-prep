import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class DashboardPage implements OnInit, OnDestroy {
  userLevel = 'A1';
  hasCompletedDiagnostic = false;
  isLoading = true;
  private subscriptions: Subscription[] = [];

  // Datos de progreso
  progressData = {
    level: 'A1',
    completedQuestions: 0,
    totalQuestions: 0,
    accuracy: 0,
    correctAnswers: 0,
    studyTime: 0
  };

  // Progreso por habilidad
  skillProgress = [
    { name: 'Grammar', value: 0, type: 'grammar' },
    { name: 'Vocabulary', value: 0, type: 'vocabulary' },
    { name: 'Reading', value: 0, type: 'reading' },
    { name: 'Listening', value: 0, type: 'listening' },
    { name: 'Writing', value: 0, type: 'writing' },
    { name: 'Speaking', value: 0, type: 'speaking' }
  ];

  // Actividades recientes
  recentActivities: any[] = [];

  // Acciones rápidas
  quickActions = [
    { name: 'Iniciar Quiz Rápido', href: '/quiz', icon: 'brain' },
    { name: 'Práctica por Tema', href: '/quiz', icon: 'book' },
    { name: 'Ver Estadísticas', href: '/stats', icon: 'stats-chart' },
    { name: 'Plan de Estudio', href: '/dashboard', icon: 'calendar' }
  ];

  // Pestañas de práctica recomendada
  selectedTab = 'reading';

  // Prácticas recomendadas por categoría
  recommendedPractice = {
    reading: [
      {
        title: 'Comprensión de Textos Largos',
        description: 'Practica la comprensión de textos académicos y literarios extensos.',
        href: '/quiz'
      },
      {
        title: 'Identificación de Ideas Principales',
        description: 'Mejora tu capacidad para identificar las ideas principales en textos complejos.',
        href: '/quiz'
      }
    ],
    listening: [
      {
        title: 'Comprensión de Conversaciones',
        description: 'Practica la comprensión de diálogos y conversaciones en diferentes contextos.',
        href: '/quiz'
      },
      {
        title: 'Identificación de Detalles',
        description: 'Mejora tu capacidad para captar detalles específicos en audios.',
        href: '/quiz'
      }
    ],
    useOfEnglish: [
      {
        title: 'Phrasal Verbs',
        description: 'Practica el uso correcto de phrasal verbs en diferentes contextos.',
        href: '/quiz'
      },
      {
        title: 'Word Formation',
        description: 'Mejora tu capacidad para formar palabras con prefijos y sufijos.',
        href: '/quiz'
      }
    ],
    writing: [
      {
        title: 'Essays',
        description: 'Practica la escritura de ensayos argumentativos y de opinión.',
        href: '/quiz'
      },
      {
        title: 'Emails Formales',
        description: 'Mejora tu capacidad para escribir emails en contextos formales.',
        href: '/quiz'
      }
    ],
    speaking: [
      {
        title: 'Descripción de Imágenes',
        description: 'Practica la descripción detallada de imágenes y fotografías.',
        href: '/quiz'
      },
      {
        title: 'Expresión de Opiniones',
        description: 'Mejora tu capacidad para expresar y defender opiniones en inglés.',
        href: '/quiz'
      }
    ]
  };

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    await this.loadUserData();
    
    // Suscribirse a cambios de usuario
    const userSub = this.authService.currentUser$.subscribe(async (user) => {
      if (user) {
        await this.loadUserData();
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadUserData() {
    const user = this.authService.currentUser;
    if (!user) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    try {
      // Cargar datos en paralelo
      await Promise.all([
        this.loadUserProfile(user.id),
        this.loadQuizStats(user.id),
        this.loadRecentActivities(user.id)
      ]);

    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadUserProfile(userId: string) {
    const { data: profile } = await this.supabaseService.getUserProfile(userId);
    if (profile) {
      this.userLevel = profile.level || 'A1';
      this.progressData.level = this.userLevel;
    }
  }

  private async loadQuizStats(userId: string) {
    const { data: quizzes } = await this.supabaseService.getQuizStats(userId);
    
    if (!quizzes || quizzes.length === 0) {
      return;
    }

    // Verificar si ha completado el diagnóstico
    this.hasCompletedDiagnostic = quizzes.some(q => q.type === 'diagnostic');

    // Calcular estadísticas generales
    const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.total_questions, 0);
    const totalCorrect = quizzes.reduce((sum, quiz) => sum + Math.round((quiz.score / 100) * quiz.total_questions), 0);
    
    this.progressData.completedQuestions = totalQuestions;
    this.progressData.totalQuestions = Math.max(totalQuestions, 200); // Mínimo 200 para mostrar progreso
    this.progressData.correctAnswers = totalCorrect;
    this.progressData.accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Calcular tiempo de estudio estimado (2 minutos por pregunta)
    this.progressData.studyTime = Math.round(totalQuestions * 2 / 60); // en horas

    // Calcular progreso por habilidad
    this.calculateSkillProgress(quizzes);
  }

  private calculateSkillProgress(quizzes: any[]) {
    // Agrupar quizzes por tipo
    const skillStats: { [key: string]: { total: number, correct: number, count: number } } = {};
    
    quizzes.forEach(quiz => {
      if (!skillStats[quiz.type]) {
        skillStats[quiz.type] = { total: 0, correct: 0, count: 0 };
      }
      
      skillStats[quiz.type].total += quiz.total_questions;
      skillStats[quiz.type].correct += Math.round((quiz.score / 100) * quiz.total_questions);
      skillStats[quiz.type].count += 1;
    });

    // Actualizar progreso por habilidad
    this.skillProgress = this.skillProgress.map(skill => {
      const stats = skillStats[skill.type];
      if (stats && stats.total > 0) {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        return { ...skill, value: accuracy };
      }
      return skill;
    });
  }

  private async loadRecentActivities(userId: string) {
    const { data: quizzes } = await this.supabaseService.getUserQuizzes(userId, 5);
    
    if (!quizzes) {
      return;
    }

    this.recentActivities = quizzes.map(quiz => {
      const timeAgo = this.getTimeAgo(new Date(quiz.created_at));
      const typeNames: { [key: string]: string } = {
        'diagnostic': 'Test de Diagnóstico',
        'grammar': 'Quiz de Gramática',
        'vocabulary': 'Quiz de Vocabulario',
        'reading': 'Quiz de Reading',
        'listening': 'Quiz de Listening',
        'writing': 'Quiz de Writing',
        'speaking': 'Quiz de Speaking'
      };

      const icons: { [key: string]: string } = {
        'diagnostic': 'brain',
        'grammar': 'text',
        'vocabulary': 'book',
        'reading': 'document-text',
        'listening': 'headset',
        'writing': 'create',
        'speaking': 'mic'
      };

      return {
        title: typeNames[quiz.type] || 'Quiz',
        description: `${quiz.score}% - ${Math.round((quiz.score / 100) * quiz.total_questions)}/${quiz.total_questions} correctas`,
        time: timeAgo,
        icon: icons[quiz.type] || 'help-circle'
      };
    });
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Método para refrescar datos
  async refreshData() {
    await this.loadUserData();
  }

  // Getter para mostrar mensaje de bienvenida personalizado
  get welcomeMessage(): string {
    const user = this.authService.currentUser;
    const name = user?.name || 'Usuario';
    
    if (!this.hasCompletedDiagnostic) {
      return `¡Hola ${name}! Comienza con el test diagnóstico`;
    }
    
    return `¡Bienvenido de nuevo, ${name}!`;
  }

  // Getter para mostrar subtítulo personalizado
  get welcomeSubtitle(): string {
    if (!this.hasCompletedDiagnostic) {
      return 'Realiza el test diagnóstico para conocer tu nivel actual';
    }
    
    if (this.progressData.completedQuestions === 0) {
      return 'Continúa tu preparación para el examen Cambridge English';
    }
    
    return `Has completado ${this.progressData.completedQuestions} preguntas con ${this.progressData.accuracy}% de precisión`;
  }

  // Getter para determinar el color del nivel
  get levelColor(): string {
    const colors: { [key: string]: string } = {
      'A1': 'danger',
      'A2': 'warning', 
      'B1': 'primary',
      'B2': 'secondary',
      'C1': 'success',
      'C2': 'tertiary'
    };
    return colors[this.progressData.level] || 'medium';
  }

  // Getter para descripción del nivel
  get levelDescription(): string {
    const descriptions: { [key: string]: string } = {
      'A1': 'Principiante',
      'A2': 'Básico',
      'B1': 'Intermedio',
      'B2': 'Intermedio Alto',
      'C1': 'Avanzado',
      'C2': 'Maestría'
    };
    return descriptions[this.progressData.level] || 'Sin determinar';
  }

  // Método para obtener el color de la habilidad
  getSkillColor(value: number): string {
    if (value >= 80) return 'success';
    if (value >= 60) return 'primary';
    if (value >= 40) return 'warning';
    return 'danger';
  }

  // Método para manejar el pull-to-refresh
  handleRefresh(event: any) {
    this.refreshData().finally(() => {
      event.target.complete();
    });
  }

  // Método para navegar a quiz específico
  startQuizByType(type: string) {
    // TODO: Implementar navegación a quiz específico
    console.log('Starting quiz type:', type);
  }

  // Método para mostrar estadísticas detalladas de una habilidad
  showSkillDetails(skill: any) {
    // TODO: Implementar modal o navegación a detalles de habilidad
    console.log('Show skill details:', skill);
  }

  // Método para obtener recomendación personalizada
  getPersonalizedRecommendation(): string {
    if (!this.hasCompletedDiagnostic) {
      return 'Completa el test diagnóstico para recibir recomendaciones personalizadas';
    }

    // Encontrar la habilidad con menor puntuación
    const weakestSkill = this.skillProgress
      .filter(skill => skill.value > 0)
      .sort((a, b) => a.value - b.value)[0];

    if (weakestSkill) {
      return `Te recomendamos practicar ${weakestSkill.name.toLowerCase()} para mejorar tu puntuación`;
    }

    return 'Continúa practicando para mejorar en todas las áreas';
  }

  // Método para obtener el progreso general
  get overallProgress(): number {
    const skillsWithData = this.skillProgress.filter(skill => skill.value > 0);
    if (skillsWithData.length === 0) return 0;
    
    const average = skillsWithData.reduce((sum, skill) => sum + skill.value, 0) / skillsWithData.length;
    return Math.round(average);
  }

  // Método para determinar si mostrar el botón de diagnóstico
  get shouldShowDiagnosticButton(): boolean {
    return !this.hasCompletedDiagnostic || this.progressData.completedQuestions === 0;
  }

  // Método para obtener el texto del botón principal
  get primaryButtonText(): string {
    if (!this.hasCompletedDiagnostic) {
      return 'Realizar Test Diagnóstico';
    }
    return 'Comenzar Quiz Personalizado';
  }

  // Método para obtener la ruta del botón principal
  get primaryButtonRoute(): string {
    if (!this.hasCompletedDiagnostic) {
      return '/diagnostic';
    }
    return '/quiz';
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }
}
