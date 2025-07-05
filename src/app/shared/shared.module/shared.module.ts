import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Componentes
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { QuizCardComponent } from '../components/quiz-card/quiz-card.component';
import { TimerComponent } from '../components/timer/timer.component';
import { ChartStatsComponent } from '../components/chart-stats/chart-stats.component';
import { ProgressLevelComponent } from '../components/progress-level/progress-level.component';
import { SubscriptionCardComponent } from '../components/subscription-card/subscription-card.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    SidebarComponent,
    QuizCardComponent,
    TimerComponent,
    ChartStatsComponent,
    ProgressLevelComponent,
    SubscriptionCardComponent
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    QuizCardComponent,
    TimerComponent,
    ChartStatsComponent,
    ProgressLevelComponent,
    SubscriptionCardComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ]
})
export class SharedModule { }
