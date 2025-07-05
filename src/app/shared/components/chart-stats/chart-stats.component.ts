import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart-stats',
  templateUrl: './chart-stats.component.html',
  styleUrls: ['./chart-stats.component.scss'],
  standalone: true,
  imports: []
})
export class ChartStatsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  
  @Input() type: ChartType = 'line';
  @Input() data: any = {};
  @Input() options: any = {};
  @Input() height: number = 300;
  
  chart!: Chart;

  constructor() { }

  ngAfterViewInit() {
    this.createChart();
  }

  private createChart() {
    if (this.chartCanvas) {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      
      const config: ChartConfiguration = {
        type: this.type,
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...this.options
        }
      };
      
      this.chart = new Chart(ctx, config);
    }
  }

  // Método para actualizar los datos del gráfico
  updateData(newData: any) {
    if (this.chart) {
      this.chart.data = newData;
      this.chart.update();
    }
  }

  // Método para actualizar las opciones del gráfico
  updateOptions(newOptions: any) {
    if (this.chart) {
      this.chart.options = {
        ...this.chart.options,
        ...newOptions
      };
      this.chart.update();
    }
  }

  // Método para destruir el gráfico cuando el componente se destruye
  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
