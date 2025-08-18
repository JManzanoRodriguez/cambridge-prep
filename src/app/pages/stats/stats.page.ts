
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  imports: [CommonModule, BaseChartDirective, IonicModule, MatCardModule, MatButtonModule, MatTabsModule, MatIconModule],
  standalone: true,
})
export class StatsPage implements OnInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  
  // Progress chart
  public progressChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [65, 70, 75, 72, 78, 82],
        label: 'Overall Score',
        backgroundColor: 'rgba(56, 128, 255, 0.2)',
        borderColor: 'rgba(56, 128, 255, 1)',
        pointBackgroundColor: 'rgba(56, 128, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(56, 128, 255, 1)',
        fill: 'origin',
      }
    ]
  };
  
  public progressChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  
  // Skills chart
  public skillsChartData: ChartData<'radar'> = {
    labels: ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing', 'Speaking'],
    datasets: [
      {
        data: [85, 75, 70, 65, 60, 55],
        label: 'Current Level',
        backgroundColor: 'rgba(56, 128, 255, 0.2)',
        borderColor: 'rgba(56, 128, 255, 1)',
        pointBackgroundColor: 'rgba(56, 128, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(56, 128, 255, 1)'
      }
    ]
  };
  
  public skillsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };
  
  // Quiz performance chart
  public quizChartData: ChartData<'bar'> = {
    labels: ['Grammar', 'Vocabulary', 'Reading', 'Listening'],
    datasets: [
      {
        data: [80, 65, 75, 60],
        label: 'Average Score',
        backgroundColor: [
          'rgba(56, 128, 255, 0.6)',
          'rgba(60, 194, 255, 0.6)',
          'rgba(82, 96, 255, 0.6)',
          'rgba(45, 211, 111, 0.6)'
        ],
        borderColor: [
          'rgba(56, 128, 255, 1)',
          'rgba(60, 194, 255, 1)',
          'rgba(82, 96, 255, 1)',
          'rgba(45, 211, 111, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  public quizChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };
  
  // Recent activity
  recentActivities = [
    { type: 'quiz', name: 'Grammar Quiz', date: '2025-05-24', score: 85 },
    { type: 'diagnostic', name: 'Diagnostic Test', date: '2025-05-20', score: 78 },
    { type: 'quiz', name: 'Vocabulary Quiz', date: '2025-05-18', score: 70 },
    { type: 'quiz', name: 'Reading Quiz', date: '2025-05-15', score: 75 }
  ];
  
  // Recommendations
  recommendations = [
    { skill: 'Grammar', topic: 'Past Perfect Tense', difficulty: 'B1' },
    { skill: 'Vocabulary', topic: 'Academic Word List', difficulty: 'B2' },
    { skill: 'Listening', topic: 'Understanding Natural Speech', difficulty: 'B1' }
  ];
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check if there's a diagnostic score in the query params
    this.route.queryParams.subscribe(params => {
      if (params['diagnosticScore'] && params['totalQuestions']) {
        const score = parseInt(params['diagnosticScore']);
        const total = parseInt(params['totalQuestions']);
        const percentage = (score / total) * 100;
        
        // Add the diagnostic test to recent activities
        this.recentActivities.unshift({
          type: 'diagnostic',
          name: 'Diagnostic Test',
          date: new Date().toISOString().split('T')[0],
          score: percentage
        });
      }
    });
  }
  
  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    return 'text-warning';
  }
}
