import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CourseService } from '../../service/course.service';
import { EnrollmentService } from '../../service/enrollment.service';
import { Course } from '../../interfaces/course.interface';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CourseSchedule } from '../../interfaces/course-schedule.interface';
import { SessionSlot } from '../../interfaces/session-slot.interface';


@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    SelectButtonModule,
    FormsModule,
    DialogComponent,
    ButtonModule
  ],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent implements OnInit {
  @Output() courseSelected = new EventEmitter<CourseSchedule>();
  @Output() courseRemoved = new EventEmitter<string>();

  courses: Course[] = [];
  layout: 'list' | 'grid' = 'list'; 
  dialogVisible = false;
  selectedCourse: Course | null = null;
  
  enrolledCourses: CourseSchedule[] = []; // para tener los cursos que me voy inscribiendo

  constructor(
    private courseService: CourseService,
    public enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.courseService.getAvailableCourses().subscribe((courses) => {
      this.courses = courses.map((course) => ({
        ...course,
        weeklyHours: this.calculateWeeklyHours(course.schedules),
      }));
    });
  }

  toggleLayout(): void {
    this.layout = this.layout === 'list' ? 'grid' : 'list';
  }

  openDialog(course: Course): void {
    this.selectedCourse = course;
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
    this.selectedCourse = null;
  }

  enrollInSchedule(schedule: CourseSchedule): void {
    if (this.enrollmentService.addCourse(schedule)) {
      this.courseSelected.emit(schedule);
      this.closeDialog();
    } else {
      alert('Conflicto de horario detectado.');
    }
  }

  removeCourse(scheduleId: string): void {
    this.enrollmentService.removeCourse(scheduleId);
    this.courseRemoved.emit(scheduleId);
  }

  private calculateWeeklyHours(schedules: any[]): number {
    let totalMinutes = 0;
    for (const schedule of schedules) {
      for (const session of schedule.sessions) {
        const [startHour, startMinute] = session.startTime.split(':').map(Number);
        const [endHour, endMinute] = session.endTime.split(':').map(Number);
        totalMinutes += (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      }
    }
    return totalMinutes / 60;
  }
  getDayAbbreviation(day: string): string {
    const dayMappings: { [key: string]: string } = {
      'LUNES': 'Lu',
      'MARTES': 'Ma',
      'MIERCOLES': 'Mi',
      'JUEVES': 'Ju',
      'VIERNES': 'Vi',
      'SABADO': 'Sa',
      'DOMINGO': 'Do',
      //  con tilde
      'MIÉRCOLES': 'Mi',
      'SÁBADO': 'Sa'
    };
    
    return dayMappings[day.toUpperCase() as keyof typeof dayMappings] || day.substring(0, 2);
  }

  toggleEnrollment(schedule: CourseSchedule): void {
    if (this.enrollmentService.isAlreadySelected(schedule.scheduleId)) {
      this.enrollmentService.removeCourse(schedule.scheduleId);
    } else {
      if (this.enrollmentService.addCourse(schedule)) {
        this.closeDialog();
      } else {
        alert('Conflicto de horario detectado.');
      }
    }
  }

  hasSessionConflict(session: SessionSlot, schedule: CourseSchedule): boolean {
    const selectedCourses = this.enrollmentService.getSelectedCourses();
    for (const selectedCourse of selectedCourses) {
      for (const selectedSession of selectedCourse.sessions) {
        if (selectedSession.day === session.day) {
          const isOverlapping = this.enrollmentService.timeOverlaps(
            selectedSession.startTime,
            selectedSession.endTime,
            session.startTime,
            session.endTime
          );
          if (isOverlapping) {
            return true;
          }
        }
      }
    }
    return false;
  }
}