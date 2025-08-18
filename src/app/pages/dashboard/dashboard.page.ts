import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class DashboardPage implements OnInit {
  userLevel = 'A1';
  hasCompletedDiagnostic = false;
  
  // Datos de progreso
  progressData = {
    level: 'A1',
    completedQuestions: 124,
    totalQuestions: 200,
    accuracy: 78,
    correctAnswers: 97,
    studyTime: 14
  };

  // Progreso por habilidad
  skillProgress = [
    { name: 'Reading', value: 75 },
    { name: 'Listening', value: 62 },
    { name: 'Use of English', value: 83 },
    { name: 'Writing', value: 58 },
    { name: 'Speaking', value: 70 }
  ];

  // Actividades recientes
  recentActivities = [
    {
      title: 'Quiz de Use of English',
      description: '8/10 respuestas correctas',
      time: 'Hace 2 horas',
      icon: 'list-circle'
    },
    {
      title: 'Práctica de Reading',
      description: 'Completado texto B2',
      time: 'Ayer',
      icon: 'book'
    },
    {
      title: 'Test de Diagnóstico',
      description: 'Nivel B2 estimado',
      time: 'Hace 3 días',
      icon: 'brain'
    }
  ];

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
  }

  private async loadUserData() {
    const user = this.authService.currentUser;
    if (!user) return;

    try {
      // Obtener perfil actualizado
      const { data: profile } = await this.supabaseService.getUserProfile(user.id);
      if (profile) {
        this.userLevel = profile.level || 'A1';
        this.progressData.level = this.userLevel;
      }

      // Verificar si ha completado el diagnóstico
      const { data: quizzes } = await this.supabaseService.getUserQuizzes(user.id, 1);
      this.hasCompletedDiagnostic = quizzes && quizzes.some(q => q.type === 'diagnostic');
      
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }
}
