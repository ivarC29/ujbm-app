import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, HostListener } from '@angular/core';
import { WeeklyScheduleResponse, EnrollmentDetailWithScheduleResponse } from '../../interfaces/student.interfaces';

interface CalendarDay {
  value: string;
  label: string;
}

interface ExtendedScheduleItem extends WeeklyScheduleResponse {
  courseCode?: string;
  courseName?: string;
}

@Component({
  selector: 'app-student-schedule-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-schedule-calendar.component.html',
  styleUrls: ['./student-schedule-calendar.component.scss']
})
export class StudentScheduleCalendarComponent implements OnInit {
  @Input() schedule?: WeeklyScheduleResponse[];
  @Input() courses?: EnrollmentDetailWithScheduleResponse[]; 
  
  showTooltip: string = '';

  days: CalendarDay[] = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
  ];

  hours: string[] = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00'
  ];  getCellClass(day: string, hour: string): string {
    const courseId = this.getCourseIdForSchedule(day, hour);
    if (courseId) {
      return this.getCourseColorClass(courseId) + ' hover:shadow-lg transform hover:scale-105 transition-all duration-200';
    }
    return 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500';
  }

  getCourseTooltip(day: string, hour: string): string {
    if (!this.schedule) return '';
    
    const hourMinutes = this.timeToMinutes(hour + ':00');
    
    for (const scheduleItem of this.schedule) {
      if (scheduleItem.day === day) {
        const startMinutes = this.timeToMinutes(scheduleItem.startTime);
        const endMinutes = this.timeToMinutes(scheduleItem.endTime);
        
        if (hourMinutes >= startMinutes && hourMinutes < endMinutes) {
          const course = this.getCourseForSchedule(scheduleItem);
          if (course) {
            return `${course.courseCode} - ${course.courseName}\n${this.formatTime(scheduleItem.startTime)} - ${this.formatTime(scheduleItem.endTime)}\nDocente: ${course.teacherName}`;
          }
        }
      }
    }
    return '';
  }
  getCourseAt(day: string, hour: string): { code: string; timeRange: string } | null {
    if (!this.schedule) return null;
    
    const hourMinutes = this.timeToMinutes(hour + ':00');
    
    for (const scheduleItem of this.schedule) {
      if (scheduleItem.day === day) {
        const startMinutes = this.timeToMinutes(scheduleItem.startTime);
        const endMinutes = this.timeToMinutes(scheduleItem.endTime);
        
        if (hourMinutes >= startMinutes && hourMinutes < endMinutes) {
          
          const courseCode = this.getCourseCodeForSchedule(scheduleItem);
          return {
            code: courseCode || 'CURSO',
            timeRange: `${this.formatTime(scheduleItem.startTime)}-${this.formatTime(scheduleItem.endTime)}`
          };
        }
      }
    }
    return null;
  }
  private getCourseCodeForSchedule(scheduleItem: WeeklyScheduleResponse): string | null {
    if (!this.courses) return null;
    
  
    for (const course of this.courses) {
      for (const schedule of course.schedules) {
        if (schedule.id === scheduleItem.id || 
            (schedule.day === scheduleItem.day && 
             schedule.startTime === scheduleItem.startTime && 
             schedule.endTime === scheduleItem.endTime)) {
          return course.courseCode;
        }
      }
    }
    return null;
  }

  private getCourseForSchedule(scheduleItem: WeeklyScheduleResponse): EnrollmentDetailWithScheduleResponse | null {
    if (!this.courses) return null;
    
    for (const course of this.courses) {
      for (const schedule of course.schedules) {
        if (schedule.id === scheduleItem.id || 
            (schedule.day === scheduleItem.day && 
             schedule.startTime === scheduleItem.startTime && 
             schedule.endTime === scheduleItem.endTime)) {
          return course;
        }
      }
    }
    return null;
  }

  private getCourseIdForSchedule(day: string, hour: string): number | null {
    if (!this.schedule) return null;
    
    const hourMinutes = this.timeToMinutes(hour + ':00');
    
    for (const scheduleItem of this.schedule) {
      if (scheduleItem.day === day) {
        const startMinutes = this.timeToMinutes(scheduleItem.startTime);
        const endMinutes = this.timeToMinutes(scheduleItem.endTime);
        
        if (hourMinutes >= startMinutes && hourMinutes < endMinutes) {
          const course = this.getCourseForSchedule(scheduleItem);
          return course?.courseSectionId || null;
        }
      }
    }
    return null;
  }

  // Colores universitarios para los cursos
  private courseColors = [
    'bg-gradient-to-br from-blue-600 to-blue-800',
    'bg-gradient-to-br from-red-600 to-red-800', 
    'bg-gradient-to-br from-blue-500 to-red-500',
    'bg-gradient-to-br from-red-500 to-blue-500',
    'bg-gradient-to-br from-blue-700 to-red-600',
    'bg-gradient-to-br from-red-700 to-blue-600',
    'bg-gradient-to-br from-blue-800 to-red-700',
    'bg-gradient-to-br from-red-800 to-blue-700'
  ];
  getCourseColorClass(courseId: number): string {
    if (!this.courses) return this.courseColors[0];
    const index = this.courses.findIndex(c => c.courseSectionId === courseId);
    return this.courseColors[index % this.courseColors.length];
  }

  getCourseForTooltip(day: string, hour: string): EnrollmentDetailWithScheduleResponse | null {
    if (!this.schedule) return null;
    
    const hourMinutes = this.timeToMinutes(hour + ':00');
    
    for (const scheduleItem of this.schedule) {
      if (scheduleItem.day === day) {
        const startMinutes = this.timeToMinutes(scheduleItem.startTime);
        const endMinutes = this.timeToMinutes(scheduleItem.endTime);
        
        if (hourMinutes >= startMinutes && hourMinutes < endMinutes) {
          return this.getCourseForSchedule(scheduleItem);
        }
      }
    }
    return null;
  }

  getTimeRangeForTooltip(day: string, hour: string): string {
    if (!this.schedule) return '';
    
    const hourMinutes = this.timeToMinutes(hour + ':00');
    
    for (const scheduleItem of this.schedule) {
      if (scheduleItem.day === day) {
        const startMinutes = this.timeToMinutes(scheduleItem.startTime);
        const endMinutes = this.timeToMinutes(scheduleItem.endTime);
        
        if (hourMinutes >= startMinutes && hourMinutes < endMinutes) {
          return `${this.formatTime(scheduleItem.startTime)} - ${this.formatTime(scheduleItem.endTime)}`;
        }
      }
    }
    return '';
  }

  private formatTime(time: string): string {
    return time.substring(0, 5); // "10:30:00" -> "10:30"
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  selectedDay: string = this.getTodayDayValue();
  isMobile: boolean = false;

  ngOnInit(): void {
    this.updateIsMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateIsMobile();
  }

  updateIsMobile() {
    // Forzar modo escritorio si el ancho es >= 1024px
    const width = window.innerWidth;
    this.isMobile = width < 1024;
    // Para depuración, puedes dejar este log temporalmente:
    // console.log('isMobile:', this.isMobile, 'width:', width);
  }

  getTodayDayValue(): string {
    const jsDay = new Date().getDay();
    
    switch (jsDay) {
      case 1: return 'MONDAY';
      case 2: return 'TUESDAY';
      case 3: return 'WEDNESDAY';
      case 4: return 'THURSDAY';
      case 5: return 'FRIDAY';
      case 6: return 'SATURDAY';
      default: return 'MONDAY';
    }
  }

  getDayLabel(dayValue: string): string {
    const found = this.days.find(d => d.value === dayValue);
    return found ? found.label : dayValue;
  }
}
