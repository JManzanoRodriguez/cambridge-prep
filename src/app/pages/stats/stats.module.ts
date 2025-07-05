
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { StatsPage } from './stats.page';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const routes: Routes = [
  {
    path: '',
    component: StatsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    RouterModule.forChild(routes),
    StatsPage
  ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  declarations: []
})
export class StatsPageModule {}
