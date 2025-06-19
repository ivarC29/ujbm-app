import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ScheduleConfig } from '../../interfaces/schedule-config.interface';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-schedule-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent],
  templateUrl: './schedule-configuration.component.html',
  styleUrls: ['./schedule-configuration.component.scss']
})
export class ScheduleConfigurationComponent implements OnInit {
  scheduleConfigs: ScheduleConfig[] = [];
  days: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  constructor(
    private router: Router,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadScheduleConfigs();
  }

  loadScheduleConfigs(): void {
    // this.settingsService.getScheduleConfigs().subscribe(configs => {
    //   this.scheduleConfigs = configs;
    // });
  }

  getConfigsByDay(day: string): ScheduleConfig[] {
    return this.scheduleConfigs.filter(config => config.day === day);
  }

  toggleAvailability(config: ScheduleConfig): void {
    // config.isAvailable = !config.isAvailable;
    // this.settingsService.updateScheduleConfig(config).subscribe(() => {
    //   // Implement success notification if needed
    // });
  }

  getDayDisplayName(day: string): string {
    const dayNames: { [key: string]: string } = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado'
    };
    return dayNames[day] || day;
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}
