import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

// Interceptores
import { httpInterceptorProviders } from './interceptors';

// Servicios
import { AuthService } from './services/auth.service';
import { QuizService } from './services/quiz.service';
import { StatsService } from './services/stats.service';
import { ThemeService } from './services/theme.service';
import { AIQuizService } from './services/ai-quiz.service';
import { SupabaseService } from './services/supabase.service';

/**
 * Módulo Core de la aplicación
 * 
 * Contiene servicios singleton, interceptores HTTP y otras funcionalidades
 * que deben estar disponibles en toda la aplicación y cargarse una sola vez.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    IonicModule
  ],
  providers: [
    // Interceptores HTTP
    httpInterceptorProviders,
    
    // Servicios
    SupabaseService,
    AuthService,
    QuizService,
    StatsService,
    ThemeService,
    AIQuizService
  ]
})
export class CoreModule {
  /**
   * Constructor que asegura que CoreModule se importe solo una vez
   * @throws Error si se intenta importar CoreModule más de una vez
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ya ha sido importado. Este módulo solo debe importarse en AppModule.');
    }
  }
}
