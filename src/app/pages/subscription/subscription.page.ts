import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SubscriptionCardComponent } from '../../shared/components/subscription-card/subscription-card.component';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.page.html',
  styleUrls: ['./subscription.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, SubscriptionCardComponent]
})
export class SubscriptionPage {
  plans = [
    {
      id: 'basic',
      name: 'Básico',
      description: 'Acceso limitado a quizzes',
      price: 0,
      currency: '$',
      period: 'mes',
      features: [
        { text: 'Quizzes limitados', enabled: true },
        { text: 'Estadísticas básicas', enabled: true },
        { text: 'Soporte estándar', enabled: true }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Acceso completo a la plataforma',
      price: 9.99,
      currency: '$',
      period: 'mes',
      isPopular: true,
      features: [
        { text: 'Quizzes ilimitados', enabled: true },
        { text: 'Estadísticas avanzadas', enabled: true },
        { text: 'Soporte premium', enabled: true }
      ]
    }
  ];

  selected = 'basic';

  onSelect(id: string) {
    this.selected = id;
  }
}
