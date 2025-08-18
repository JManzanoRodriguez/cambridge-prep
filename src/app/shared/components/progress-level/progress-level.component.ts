import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-progress-level',
  templateUrl: './progress-level.component.html',
  styleUrls: ['./progress-level.component.scss'],
  imports: [],
  standalone: true,
})
export class ProgressLevelComponent {
  @Input() progress: number = 0; // Valor de progreso (0-100)
  @Input() level: string = 'A1'; // Nivel actual (A1, A2, B1, B2, C1, C2)
  @Input() showLevel: boolean = true; // Mostrar o no el nivel
  @Input() showPercentage: boolean = true; // Mostrar o no el porcentaje
  @Input() height: string = '0.5rem'; // Altura de la barra de progreso
  @Input() label: string = ''; // Etiqueta opcional para la barra de progreso

  // Mapeo de niveles a colores
  levelColors: { [key: string]: string } = {
    'A1': '#ef4444', // Rojo
    'A2': '#f97316', // Naranja
    'B1': '#f59e0b', // Ámbar
    'B2': '#10b981', // Verde
    'C1': '#3b82f6', // Azul
    'C2': '#6366f1'  // Índigo
  };

  constructor() { }

  // Obtener el color basado en el nivel
  getLevelColor(): string {
    return this.levelColors[this.level] || this.levelColors['A1'];
  }

  // Obtener el color basado en el progreso
  getProgressColor(): string {
    if (this.progress < 20) return this.levelColors['A1'];
    if (this.progress < 40) return this.levelColors['A2'];
    if (this.progress < 60) return this.levelColors['B1'];
    if (this.progress < 80) return this.levelColors['B2'];
    if (this.progress < 95) return this.levelColors['C1'];
    return this.levelColors['C2'];
  }
}
