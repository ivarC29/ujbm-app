import { Component, Input } from '@angular/core';
import { EnrolledCourse } from '../../interfaces/enrolled-course.interface';
import { SessionSlot } from '../../interfaces/session-slot.interface';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-enrollment-table',
  imports: [CommonModule, TableModule],
  templateUrl: './enrollment-table.component.html',
  styleUrl: './enrollment-table.component.scss'
})
export class EnrollmentTableComponent {
  @Input() enrolledCourses: EnrolledCourse[] = [];

  calculateWeeklyHours(sessions: SessionSlot[]): number {
    if (!sessions || sessions.length === 0) {
      return 0;
    }
  
    return sessions.reduce((totalHours, session) => {
      const [startHour, startMinute] = session.startTime.split(':').map(Number);
      const [endHour, endMinute] = session.endTime.split(':').map(Number);
      const sessionDuration = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
      return totalHours + sessionDuration;
    }, 0);
  }

  formatSchedule(sessions: SessionSlot[]): string {
    return sessions.map(session => 
      `${session.day} ${session.startTime} - ${session.endTime}`
    ).join('\n');
  }
}
