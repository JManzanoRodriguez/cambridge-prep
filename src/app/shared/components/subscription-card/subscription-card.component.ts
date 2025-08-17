import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

export interface SubscriptionFeature {
  text: string;
  enabled: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: string;
  features: SubscriptionFeature[];
  isPopular?: boolean;
}

@Component({
  selector: 'app-subscription-card',
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
  standalone: true,
})
export class SubscriptionCardComponent {
  @Input() plan!: SubscriptionPlan;
  @Input() isSelected: boolean = false;
  @Output() selectPlan = new EventEmitter<string>();

  constructor() { }

  onSelectPlan() {
    this.selectPlan.emit(this.plan.id);
  }

  // Formatear precio para mostrar
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
