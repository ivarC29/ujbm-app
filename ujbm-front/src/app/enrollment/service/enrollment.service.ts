import { Injectable } from '@angular/core';
import { Course } from '../interfaces/course.interface';
import { CourseSchedule } from '../interfaces/course-schedule.interface';
import { CourseService } from './course.service';
import { EnrolledCourse } from '../interfaces/enrolled-course.interface';

const SELECTED_COURSES_KEY = 'selected-courses';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private availableCourses: Course[] = []; // Esto se setea en el componente al cargar desde el CourseService

  constructor(private courseService: CourseService) {
    this.loadAvailableCourses();
  }
   // Cargar los cursos disponibles desde el CourseService
   private loadAvailableCourses(): void {
    this.courseService.getAvailableCourses().subscribe((courses) => {
      this.availableCourses = courses;
    });
  }

  // Se usa para inyectar los cursos simulados desde CourseService
  setAvailableCourses(courses: Course[]): void {
    this.availableCourses = courses;
  }

  getAvailableCourses(): Course[] {
    return this.availableCourses;
  }

  getSelectedCourses(): EnrolledCourse[] {
    const data = localStorage.getItem(SELECTED_COURSES_KEY);
    return data ? JSON.parse(data) : [];
  }
 // Agrega un curso seleccionado
 addCourse(schedule: CourseSchedule): boolean {
  const currentSchedules = this.getSelectedCourses();
  const courseId = schedule.scheduleId.split('-')[0];

  if (this.isAlreadySelected(courseId)) {
    return false;
  }

  if (this.hasConflict(schedule, currentSchedules)) {
    return false;
  }

  const course = this.availableCourses.find((c) => c.id === courseId);
  if (!course) {
    console.error(`El curso con ID ${courseId} no se encontró en los cursos disponibles.`);
    return false;
  }

  const scheduleWithDetails: EnrolledCourse = {
    ...schedule,
    name: course.name,
    credits: course.credits,
    cycle: course.cycle,
  };

  const updatedSchedules = [...currentSchedules, scheduleWithDetails];
  localStorage.setItem(SELECTED_COURSES_KEY, JSON.stringify(updatedSchedules));
  return true;
}

removeCourse(courseId: string): void {
  const currentSchedules = this.getSelectedCourses();
  const updatedSchedules = currentSchedules.filter(schedule => 
    !schedule.scheduleId.startsWith(courseId.split('-')[0])
  );
  localStorage.setItem(SELECTED_COURSES_KEY, JSON.stringify(updatedSchedules));
}



  // Verifica si un curso ya está seleccionado
  isAlreadySelected(courseId: string): boolean {
    return this.getSelectedCourses().some(schedule => 
      schedule.scheduleId.startsWith(courseId)
    );
  }
// Verifica si hay conflictos de horari
hasConflict(newSchedule: CourseSchedule, selectedSchedules: CourseSchedule[]): boolean {
  
  selectedSchedules = selectedSchedules.filter(s => 
    !s.scheduleId.startsWith(newSchedule.scheduleId.split('-')[0])
  );

  for (const selectedSchedule of selectedSchedules) {
    for (const selectedSession of selectedSchedule.sessions) {
      for (const newSession of newSchedule.sessions) {
        if (selectedSession.day === newSession.day) {
          if (this.timeOverlaps(
            selectedSession.startTime,
            selectedSession.endTime,
            newSession.startTime,
            newSession.endTime
          )) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
// Verifica si dos horarios se superponen
 timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Minutes = toMinutes(start1);
  const end1Minutes = toMinutes(end1);
  const start2Minutes = toMinutes(start2);
  const end2Minutes = toMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}
 // Limpia las selecciones
  clearSelections(): void {
    localStorage.removeItem(SELECTED_COURSES_KEY);
  }

  // Devuelve los eventos para FullCalendar 
  getCalendarEvents(): { title: string; start: string; end: string; daysOfWeek: number[] }[] {
    const selected = this.getSelectedCourses();
    const dayMap = {
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    const events: any[] = [];

    selected.forEach(schedule => {
      schedule.sessions.forEach(session => {
        events.push({
          title: `${schedule.section} - ${schedule.teacher.name}`,
          startTime: session.startTime,
          endTime: session.endTime,
          daysOfWeek: [dayMap[session.day]],
        });
      });
    });

    return events;
  }
}
