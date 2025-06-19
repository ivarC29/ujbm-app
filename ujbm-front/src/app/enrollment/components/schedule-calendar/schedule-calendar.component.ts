import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { SessionSlot } from '../../interfaces/session-slot.interface';
import timeGridPlugin from '@fullcalendar/timegrid'
import { CalendarOptions } from '@fullcalendar/core';


@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './schedule-calendar.component.html',
  styleUrl: './schedule-calendar.component.scss',
})
export class ScheduleCalendarComponent {
  @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;

  @Input() set sessions(value: SessionSlot[]) {
    if (value) {
      this.updateEvents(value);
    }
  }

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    titleFormat: { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    buttonText: {
      today: 'Hoy',
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    allDaySlot: false,
    expandRows: true,
    slotEventOverlap: false,
    weekends: false,
    events: [],
    locale: 'es',
    slotDuration: '00:30:00',
    height: 'auto',
    //para el responsive
    contentHeight: 'auto', // Ajusta la altura automáticamente
    aspectRatio: 1.35, // Cambia la relación de aspecto para vistas pequeñas
    windowResize: () => {
      if (window.innerWidth < 768) {
        this.calendarComponent.getApi().changeView('timeGridDay'); // Cambia a vista diaria
      } else {
        this.calendarComponent.getApi().changeView('timeGridWeek'); // Cambia a vista semanal
      }
    }
}

  private dayMapping: { [key: string]: number } = {
    'LUNES': 1,
    'MARTES': 2,
    'MIERCOLES': 3,
    'JUEVES': 4,
    'VIERNES': 5,
    'SABADO': 6,
    'DOMINGO': 0
  };
//cada se llame a ssesion se actualiza el calendario
  private updateEvents(sessions: SessionSlot[]): void {
    const events = sessions.map(session => ({
      title: session.courseName || 'Clase',
      daysOfWeek: [this.dayMapping[session.day]],
      startTime: session.startTime,
      endTime: session.endTime,
      backgroundColor: this.getRandomColor(),
      borderColor: this.getRandomColor()
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events
    };
  }

  private getRandomColor(): string {
    //colores random para el calendario
    const colors = [
    // Greens
    '#4ade80', '#10b981', '#059669',
    // Blues
    '#60a5fa', '#3b82f6', '#2563eb',
    // Oranges/Yellows
    '#f59e0b', '#fbbf24', '#f97316',
    // Purples/Pinks
    '#e879f9', '#d946ef', '#c026d3',
    // Reds
    '#ef4444', '#dc2626', '#b91c1c',
    // Teals/Cyans
    '#2dd4bf', '#06b6d4', '#0891b2',
    // Indigos
    '#818cf8', '#6366f1', '#4f46e5',
    // Rose/Pinks
    '#fb7185', '#f43f5e', '#e11d48',
    // Lime/Yellow-greens
    '#a3e635', '#84cc16', '#65a30d'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}