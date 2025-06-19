import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentService } from '../../services/student.service';
import { EnrollmentDetailsWithScheduleResponse, WeeklyScheduleResponse } from '../../interfaces/student.interfaces';
import { StudentScheduleCalendarComponent } from '../../components/student-schedule-calendar/student-schedule-calendar.component';

@Component({
  selector: 'app-student-enrollment-courses-page',
  standalone: true,
  imports: [CommonModule, StudentScheduleCalendarComponent],
  templateUrl: './student-enrollment-courses-page.component.html',
  styleUrls: ['./student-enrollment-courses-page.component.scss']
})
export default class StudentEnrollmentCoursesPageComponent {
  enrollmentData?: EnrollmentDetailsWithScheduleResponse;
  loading = true;
  error = '';
  view: 'list' | 'calendar' = 'list';
  selectedCourseId?: number;

  constructor(private studentService: StudentService) {
    this.loadData();
  }

  loadData() {
    this.studentService.getEnrolledSectionsWithSchedules().subscribe({
      next: (data) => {
        this.enrollmentData = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los cursos.';
        this.loading = false;
      }
    });
  }

  showList() {
    this.view = 'list';
    this.selectedCourseId = undefined;
  }

  showCalendar(courseId?: number) {
    this.selectedCourseId = courseId;
    this.view = 'calendar';
  }
  getTotalCredits(): number {
    if (!this.enrollmentData) return 0;
    return this.enrollmentData.details.reduce((sum, d) => sum + d.credits, 0);
  }

  getSelectedSchedule(): WeeklyScheduleResponse[] | undefined {
    if (!this.enrollmentData) return undefined;
    if (this.selectedCourseId) {
      const course = this.enrollmentData.details.find(d => d.courseSectionId === this.selectedCourseId);
      return course?.schedules;
    }
    // Si no hay curso seleccionado, mostrar todos los horarios
    return this.enrollmentData.details.flatMap(d => d.schedules);
  }

  // Utility methods for time and day 
  private dayMapping: { [key: string]: string } = {
    'MONDAY': 'LUN',
    'TUESDAY': 'MAR', 
    'WEDNESDAY': 'MIÉ',
    'THURSDAY': 'JUE',
    'FRIDAY': 'VIE',
    'SATURDAY': 'SÁB',
    'SUNDAY': 'DOM'
  };

  getDayAbbreviation(day: string): string {
    return this.dayMapping[day] || day;
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

  // Colores universitarios para los cursos
  private courseColors = [
    'from-blue-600 to-blue-800',
    'from-red-600 to-red-800', 
    'from-blue-500 to-red-500',
    'from-red-500 to-blue-500',
    'from-blue-700 to-red-600',
    'from-red-700 to-blue-600',
    'from-blue-800 to-red-700',
    'from-red-800 to-blue-700'
  ];

  getCourseColor(courseId: number): string {
    if (!this.enrollmentData) return this.courseColors[0];
    const index = this.enrollmentData.details.findIndex(d => d.courseSectionId === courseId);
    return this.courseColors[index % this.courseColors.length];
  }

  getCourseColorClass(courseId: number): string {
    return `bg-gradient-to-br ${this.getCourseColor(courseId)}`;
  }
}
