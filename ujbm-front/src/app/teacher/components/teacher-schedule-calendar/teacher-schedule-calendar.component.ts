import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { TeacherCourseSectionResponse } from '../../interfaces/teacher.interfaces';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarOptions, EventInput } from '@fullcalendar/core/index.js';
import { TeacherService } from '../../services/teacher-service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-teacher-schedule-calendar',
  imports: [
    CommonModule,
    FullCalendarModule,
    ToastModule,
    ButtonModule,
    ProgressSpinnerModule,
],
  providers: [MessageService],
  templateUrl: './teacher-schedule-calendar.component.html',
  styleUrl: './teacher-schedule-calendar.component.scss'
})
export class TeacherScheduleCalendarComponent implements OnInit {
  courseSections: TeacherCourseSectionResponse[] = [];
  loading = true;
  
  @ViewChild(FullCalendarComponent) calendarComponent?: FullCalendarComponent;

  calendarOptions!: CalendarOptions;

  private courseColors: string[] = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  selectedDay: string = this.getTodayDayValue();
  isMobile: boolean = false;

  constructor(
    private teacherService: TeacherService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.updateIsMobile();
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialView: this.isMobile ? 'timeGridDay' : 'timeGridWeek',
      locale: esLocale,
      weekends: true,
      editable: false,
      selectable: false,
      selectMirror: true,
      dayMaxEvents: true,
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00',
      height: 'auto',
      eventClick: this.handleEventClick.bind(this),
      eventDidMount: this.handleEventDidMount.bind(this),
      events: []
    };
    this.loadSchedule();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateIsMobile();
    // No forzar vista ni nada más
  }

  updateIsMobile() {
    this.isMobile = window.innerWidth < 1024;
  }

  getTodayDayValue(): string {
    const jsDay = new Date().getDay();
    // 0: domingo, 1: lunes, ...
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
    const days = [
      { value: 'MONDAY', label: 'Lunes' },
      { value: 'TUESDAY', label: 'Martes' },
      { value: 'WEDNESDAY', label: 'Miércoles' },
      { value: 'THURSDAY', label: 'Jueves' },
      { value: 'FRIDAY', label: 'Viernes' },
      { value: 'SATURDAY', label: 'Sábado' },
    ];
    const found = days.find(d => d.value === dayValue);
    return found ? found.label : dayValue;
  }

  loadSchedule(): void {
    this.loading = true;
    this.teacherService.getMyCourses().subscribe({
      next: (sections) => {
        this.courseSections = sections;
        this.generateCalendarEvents();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el horario'
        });
        this.loading = false;
      }
    });
  }

  generateCalendarEvents(): void {
    const events: EventInput[] = [];
    
    this.courseSections.forEach((section, index) => {
      const color = this.courseColors[index % this.courseColors.length];
      
      section.weeklySchedules.forEach((schedule) => {
        // Generar eventos para las próximas 8 semanas
        for (let week = 0; week < 8; week++) {
          const eventDate = this.getNextWeekday(schedule.day, week);
          
          events.push({
            id: `${section.id}-${schedule.id}-${week}`,
            title: `${section.course.code} - ${section.section}`,
            start: `${eventDate}T${schedule.startTime}`,
            end: `${eventDate}T${schedule.endTime}`,
            backgroundColor: color,
            borderColor: color,
            textColor: '#ffffff',
            extendedProps: {
              courseCode: section.course.code,
              courseName: section.course.name,
              section: section.section,
              teacherName: section.teacherName,
              vacancies: section.vacancies,
              day: schedule.day,
              startTime: schedule.startTime,
              endTime: schedule.endTime
            }
          });
        }
      });
    });
    
    this.calendarOptions.events = events;
  }

  private getNextWeekday(dayName: string, weeksFromNow: number = 0): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const targetDay = days.indexOf(dayName);
    
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget + (weeksFromNow * 7));
    
    return targetDate.toISOString().split('T')[0];
  }

  handleEventClick(clickInfo: any): void {
    const event = clickInfo.event;
    const props = event.extendedProps;
    
    this.messageService.add({
      severity: 'info',
      summary: `${props.courseCode} - ${props.courseName}`,
      detail: `Sección ${props.section} | ${props.startTime.substring(0,5)} - ${props.endTime.substring(0,5)}`,
      life: 3000
    });
  }

  handleEventDidMount(info: any): void {
    // Agregar tooltip personalizado
    info.el.title = `${info.event.extendedProps.courseName}\nSección: ${info.event.extendedProps.section}\nHorario: ${info.event.extendedProps.startTime.substring(0,5)} - ${info.event.extendedProps.endTime.substring(0,5)}`;
  }

  getCourseColor(sectionId: number): string {
    const index = this.courseSections.findIndex(s => s.id === sectionId);
    return this.courseColors[index % this.courseColors.length];
  }

  getTotalWeeklyHours(): string {
    const totalMinutes = this.courseSections.reduce((total, section) => {
      return total + section.weeklySchedules.reduce((sectionTotal, schedule) => {
        const start = this.timeToMinutes(schedule.startTime);
        const end = this.timeToMinutes(schedule.endTime);
        return sectionTotal + (end - start);
      }, 0);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  getUniqueDays(): string[] {
    const days = new Set<string>();
    this.courseSections.forEach(section => {
      section.weeklySchedules.forEach(schedule => {
        days.add(schedule.day);
      });
    });
    return Array.from(days);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  refreshCalendar(): void {
    this.loadSchedule();
  }

  exportSchedule(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Funcionalidad en desarrollo',
      detail: 'Exportación de horario próximamente'
    });
  }
}
