import { Injectable } from '@angular/core';
import { Course } from '../interfaces/course.interface';
import { Teacher } from '../interfaces/teacher.interface';
import { CourseSchedule } from '../interfaces/course-schedule.interface';
import { SessionSlot } from '../interfaces/session-slot.interface';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { ApiPaths } from '@shared/utils/api-paths';

// Interfaces matching the actual backend response


// Transformed interfaces for UI
export interface AvailableCourseSection {
  enrollmentDetailId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  cycle: number;
  section: string;
  teacherName: string;
  vacancies: number;
  sessions: {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
  enrollmentDetailStatus: string;
}

export interface GroupedAvailableCourseSections {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  cycle: number;
  sections: AvailableCourseSection[];
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  private get token(): string {
    return localStorage.getItem('access_token') || '';
  }

  private getAuthHeaders(): { [header: string]: string } {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  getAvailableCourses(): Observable<Course[]> {
    return of([
      {
        id: 'PER201',
        code: 'PER201',
        name: 'Redacción Periodística I',
        credits: 3,
        cycle: 2,
        isMandatory: false,
        schedules: [
          {
            scheduleId: 'PER201-A',
            section: 'A',
            teacher: { id: 1, name: 'Carlos García' },
            modality: 'PRESENCIAL',
            sessions: [
              { id: '1', day: 'LUNES', startTime: '08:00', endTime: '10:00', classroom: 'J-101' },
              { id: '2', day: 'MIERCOLES', startTime: '08:00', endTime: '10:00', classroom: 'J-101' },
            ],
          },
        ],
      },
      {
        id: 'PER202',
        code: 'PER202',
        name: 'Fundamentos de la Comunicación',
        credits: 3,
        cycle: 2,
        isMandatory: false,
        schedules: [
          {
            scheduleId: 'PER202-A',
            section: 'A',
            teacher: { id: 2, name: 'Lucía Méndez' },
            modality: 'VIRTUAL',
            sessions: [
              { id: '3', day: 'MARTES', startTime: '10:00', endTime: '12:00', classroom: 'Virtual' },
            ],
          },
        ],
      },
      {
        id: 'PER203',
        code: 'PER203',
        name: 'Lenguaje y Expresión Oral',
        credits: 2,
        cycle: 2,
        isMandatory: false,
        schedules: [
          {
            scheduleId: 'PER203-B1',
            section: 'B',
            teacher: { id: 3, name: 'Antonio Silva' },
            modality: 'HIBRIDO',
            sessions: [
              { id: '4', day: 'JUEVES', startTime: '08:00', endTime: '10:00', classroom: 'K-202' },
              
            ],
          },
          {
            scheduleId: 'PER203-B2',
            section: 'B',
            teacher: { id: 3, name: 'Antonio Silva' },
            modality: 'HIBRIDO',
            sessions: [
              { id: '8', day: 'MARTES', startTime: '10:00', endTime: '12:00', classroom: 'K-202' },
              
            ],
          },
        ],
      },
      {
        id: 'PER204',
        code: 'PER204',
        name: 'Historia del Periodismo',
        credits: 3,
        cycle: 2,
        isMandatory: false,
        schedules: [
          {
            scheduleId: 'PER204-A',
            section: 'A',
            teacher: { id: 4, name: 'Elena Paredes' },
            modality: 'PRESENCIAL',
            sessions: [
              { id: '5', day: 'VIERNES', startTime: '10:00', endTime: '12:00', classroom: 'L-303' },
            ],
          },
        ],
      },
      {
        id: 'PER205',
        code: 'PER205',
        name: 'Producción Audiovisual I',
        credits: 4,
        cycle: 2,
        isMandatory: false,
        schedules: [
          {
            scheduleId: 'PER205-A',
            section: 'A',
            teacher: { id: 5, name: 'Martín Torres' },
            modality: 'PRESENCIAL',
            sessions: [
              { id: '6', day: 'MIERCOLES', startTime: '14:00', endTime: '17:00', classroom: 'Estudio TV 1' },
            ],
          },
        ],
      },
      {
        id: 'PER206',
        code: 'PER206',
        name: 'Ética en la Comunicación',
        credits: 2,
        cycle: 2,
        isMandatory: false,
        schedules: [
          {
            scheduleId: 'PER206-A',
            section: 'A',
            teacher: { id: 6, name: 'Sofía Rivas' },
            modality: 'VIRTUAL',
            sessions: [
              { id: '7', day: 'JUEVES', startTime: '16:30', endTime: '18:30', classroom: 'Virtual' },
            ],
          },
        ],
      },
    ]);
  }

  

  calculateWeeklyHours(schedules: CourseSchedule[]): number {
    let totalMinutes = 0;
    for (const schedule of schedules) {
      for (const session of schedule.sessions) {
        const [startHour, startMinute] = session.startTime.split(':').map(Number);
        const [endHour, endMinute] = session.endTime.split(':').map(Number);
        const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        totalMinutes += duration;
      }
    }
    return totalMinutes / 60;
  }
}
