import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ChipModule } from "primeng/chip";
import { DialogModule } from "primeng/dialog";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { TeacherCourseSectionResponse } from "src/app/teacher/interfaces/teacher.interfaces";

@Component({
  selector: 'app-section-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ChipModule
  ],
  template: `
    <div class="section-details-container">
      <div class="details-header flex items-center justify-between mb-6">
    <div>
      <span class="course-code font-bold text-blue-600 dark:text-blue-300 text-lg">{{ section.course.code }}</span>
      <span class="section-badge bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs ml-2">Sección {{ section.section }}</span>
    </div>
    <div class="period-info flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <i class="pi pi-calendar"></i>
      <span>{{ section.academicPeriodName }}</span>
    </div>
  </div>

  <div class="info-section mb-4">
    <h3 class="section-title text-indigo-600 dark:text-indigo-300 font-semibold mb-2 flex items-center gap-2">
      <i class="pi pi-book"></i> Información del Curso
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <div><span class="font-semibold">Nombre:</span> {{ section.course.name }}</div>
      <div><span class="font-semibold">Código:</span> {{ section.course.code }}</div>
      <div><span class="font-semibold">Créditos:</span> {{ section.course.credits }}</div>
      <div><span class="font-semibold">Ciclo:</span> {{ section.course.cycle }}</div>
      <div><span class="font-semibold">Vacantes:</span> {{ section.vacancies }}</div>
    </div>
  </div>

  <div class="info-section mb-4">
    <h3 class="section-title text-indigo-600 dark:text-indigo-300 font-semibold mb-2 flex items-center gap-2">
      <i class="pi pi-user"></i> Docente
    </h3>
    <div class="flex items-center gap-3">
      <div class="rounded-full bg-indigo-100 dark:bg-indigo-800 p-2">
        <i class="pi pi-user text-indigo-600 dark:text-indigo-200"></i>
      </div>
      <div>
        <div class="font-semibold">{{ section.teacherName }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ section.teacherId }}</div>
      </div>
    </div>
  </div>

  <div class="info-section mb-4">
    <h3 class="section-title text-indigo-600 dark:text-indigo-300 font-semibold mb-2 flex items-center gap-2">
      <i class="pi pi-clock"></i> Horarios de Clase
    </h3>
    <div class="flex flex-col gap-2">
      @for (schedule of section.weeklySchedules; track schedule.id) {
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded p-2">
          <span class="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-mono">{{ getDayAbbreviation(schedule.day) }}</span>
          <span class="font-mono">{{ formatTime(schedule.startTime) }} - {{ formatTime(schedule.endTime) }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">({{ calculateDuration(schedule.startTime, schedule.endTime) }})</span>
          <span class="ml-auto">
            <i [class]="schedule.available ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
          </span>
        </div>
      }
    </div>
  </div>

  <div class="info-section">
    <h3 class="section-title text-indigo-600 dark:text-indigo-300 font-semibold mb-2 flex items-center gap-2">
      <i class="pi pi-chart-bar"></i> Estadísticas
    </h3>
    <div class="flex gap-6">
      <div>
        <div class="text-lg font-bold">{{ getTotalWeeklyHours() }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Horas Semanales</div>
      </div>
      <div>
        <div class="text-lg font-bold">{{ section.weeklySchedules.length }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Clases por Semana</div>
      </div>
      <div>
        <div class="text-lg font-bold">{{ section.course.credits }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Créditos</div>
      </div>
      <div>
        <div class="text-lg font-bold">{{ section.vacancies }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Vacantes</div>
      </div>
    </div>
  </div>

  <div class="dialog-footer mt-6 flex justify-end">
    <button 
      pButton 
      type="button"
      label="Cerrar"
      icon="pi pi-times"
      class="p-button-secondary"
      (click)="closeDialog()"
    ></button>
  </div>
    </div>
  `,
  styles: [`
  `],
})
export class SectionDetailsDialogComponent implements OnInit {
  section!: TeacherCourseSectionResponse;

  private dayMapping: { [key: string]: string } = {
    'MONDAY': 'LUN',
    'TUESDAY': 'MAR',
    'WEDNESDAY': 'MIÉ',
    'THURSDAY': 'JUE',
    'FRIDAY': 'VIE',
    'SATURDAY': 'SÁB',
    'SUNDAY': 'DOM'
  };

  private dayFullNames: { [key: string]: string } = {
    'MONDAY': 'Lunes',
    'TUESDAY': 'Martes',
    'WEDNESDAY': 'Miércoles',
    'THURSDAY': 'Jueves',
    'FRIDAY': 'Viernes',
    'SATURDAY': 'Sábado',
    'SUNDAY': 'Domingo'
  };

  constructor(
    public ref: DynamicDialogRef,
    @Inject(DynamicDialogConfig) public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.section = this.config.data?.section;
  }

  getDayAbbreviation(day: string): string {
    return this.dayMapping[day] || day;
  }

  getDayFullName(day: string): string {
    return this.dayFullNames[day] || day;
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const duration = end - start;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getTotalWeeklyHours(): string {
    const totalMinutes = this.section.weeklySchedules.reduce((total, schedule) => {
      const start = this.timeToMinutes(schedule.startTime);
      const end = this.timeToMinutes(schedule.endTime);
      return total + (end - start);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  closeDialog(): void {
    this.ref.close();
  }

}