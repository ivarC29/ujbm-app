import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EnrollmentDetailWithScheduleResponse } from '../../interfaces/student.interfaces';

@Component({
  selector: 'app-student-courses-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-courses-list.component.html',
  styleUrls: ['./student-courses-list.component.scss']
})
export class StudentCoursesListComponent {
  @Input() courses: EnrollmentDetailWithScheduleResponse[] = [];
  @Output() verHorario = new EventEmitter<number>();
}
