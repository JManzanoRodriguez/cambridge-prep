import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPage } from './subscription.page';
import { SubscriptionCardComponent } from '../../shared/components/subscription-card/subscription-card.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    SubscriptionCardComponent,
    SubscriptionPage
  ]
})
export class SubscriptionPageModule {}
