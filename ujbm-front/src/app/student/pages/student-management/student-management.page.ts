import { Component } from '@angular/core';
import { StudentTableComponent } from '../../components/student-table/student-table.component';

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [StudentTableComponent],
  templateUrl: './student-management.page.html',
  styleUrls: ['./student-management.page.scss']
})
export default class StudentManagementPage {}
