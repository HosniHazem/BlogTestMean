import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, AnalyticsData } from '../../core/services/analytics.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  analytics: AnalyticsData | null = null;
  loading = true;
  private charts: Chart[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.analyticsService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
        setTimeout(() => this.initCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  initCharts(): void {
    if (!this.analytics) return;

    this.createArticlesChart();
    this.createAuthorsChart();
    this.createTagsChart();
  }

  createArticlesChart(): void {
    const canvas = document.getElementById('articlesChart') as HTMLCanvasElement;
    if (!canvas || !this.analytics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.analytics.articlesPerMonth.map(d => d.month),
        datasets: [{
          label: 'Articles par mois',
          data: this.analytics.articlesPerMonth.map(d => d.count),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  createAuthorsChart(): void {
    const canvas = document.getElementById('authorsChart') as HTMLCanvasElement;
    if (!canvas || !this.analytics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.analytics.topAuthors.map(a => a.username),
        datasets: [{
          label: 'Nombre d\'articles',
          data: this.analytics.topAuthors.map(a => a.articleCount),
          backgroundColor: '#48bb78',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  createTagsChart(): void {
    const canvas = document.getElementById('tagsChart') as HTMLCanvasElement;
    if (!canvas || !this.analytics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.analytics.topTags.map(t => t.tag),
        datasets: [{
          data: this.analytics.topTags.map(t => t.count),
          backgroundColor: [
            '#667eea',
            '#48bb78',
            '#fc8181',
            '#f6ad55',
            '#68d391',
            '#63b3ed'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }
}
