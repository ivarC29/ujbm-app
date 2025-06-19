import { Component } from '@angular/core';
import { TeacherTableComponent } from '../../components/teacher-table/teacher-table.component';

@Component({
  selector: 'app-teacher-management',
  standalone: true,
  imports: [TeacherTableComponent],
  templateUrl: './teacher-management.component.html',
  styleUrl: './teacher-management.component.scss'
})
export default class TeacherManagementComponent {

}
