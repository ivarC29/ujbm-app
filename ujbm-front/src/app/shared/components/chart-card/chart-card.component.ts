import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ChartDataDTO } from 'src/app/dashboard/interfaces/applicant-dashboard.interface';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule],  template: `
    <p-card class="chart-card">
      <div class="chart-header">
        <div class="title-section">
          @if (icon) {
            <i class="pi {{ icon }} chart-icon"></i>
          }
          <h3 class="chart-title">{{ title }}</h3>
        </div>
        @if (data.length === 0) {
          <span class="no-data">Sin datos disponibles</span>
        }
      </div>
      <div class="chart-container">        @if (data.length > 0) {
          <p-chart 
            [type]="chartType" 
            [data]="chartData" 
            [options]="chartOptions"
            [width]="'100%'"
            [height]="'300px'"
          ></p-chart>
        }
      </div>
    </p-card>
  `,
  styleUrl: './chart-card.component.scss',
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() icon = '';
  @Input() data: ChartDataDTO[] = [];
  @Input() chartType: 'bar' | 'pie' | 'doughnut' = 'bar';

  get chartData() {
    const labels = this.data.map(item => item.name);
    const values = this.data.map(item => Number(item.value));
    
    if (this.chartType === 'bar') {
      return {
        labels: labels,
        datasets: [{
          label: this.title,
          data: values,
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
          ],
          borderColor: [
            '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED',
            '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
          ],
          borderWidth: 1
        }]
      };
    } else {
      return {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      };
    }
  }

  get chartOptions() {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: this.chartType === 'bar' ? 'top' : 'bottom',
          labels: {
            usePointStyle: true,
            color: '#6B7280',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F9FAFB',
          bodyColor: '#F9FAFB',
          borderColor: '#374151',
          borderWidth: 1
        }
      }
    };

    if (this.chartType === 'bar') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB'
            },
            ticks: {
              color: '#6B7280'
            }
          },
          x: {
            grid: {
              color: '#E5E7EB'
            },
            ticks: {
              color: '#6B7280'
            }
          }
        }
      };
    }

    return baseOptions;
  }
}
