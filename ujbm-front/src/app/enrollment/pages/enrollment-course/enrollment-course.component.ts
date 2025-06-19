import { Component } from '@angular/core';
import { EnrollmentTableComponent } from '../../components/enrollment-table/enrollment-table.component';
import { PageTitleComponent } from '@shared/components/page-title/page-title.component';
import { EnrolledCourse } from '../../interfaces/enrolled-course.interface';
import { EnrollmentService } from '../../service/enrollment.service';
import { SessionSlot } from '../../interfaces/session-slot.interface';
import { ScheduleCalendarComponent } from "../../components/schedule-calendar/schedule-calendar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enrollment-course',
  imports: [EnrollmentTableComponent, PageTitleComponent, ScheduleCalendarComponent,CommonModule],
  templateUrl: './enrollment-course.component.html',
  styleUrl: './enrollment-course.component.scss'
})
export default class EnrollmentCourseComponent {
registeredCourses: EnrolledCourse[] = [];
allSessions: SessionSlot[] = [];
constructor(private enrollmentService: EnrollmentService) {}

  ngOnInit(): void {
    this.loadEnrolledCourses();
  }

  loadEnrolledCourses(): void {
    this.registeredCourses = this.enrollmentService.getSelectedCourses();
    this.allSessions = this.registeredCourses.flatMap(course =>
      course.sessions.map(session => ({
        ...session,
        courseName: `${course.name} - ${course.section}`
      }))
    );
  }
}
