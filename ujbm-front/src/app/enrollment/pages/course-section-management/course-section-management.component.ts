import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseSectionsTableComponent } from '../../components/course-sections-table/course-sections-table.component';

@Component({
  selector: 'app-course-section-management',
  standalone: true,
  imports: [CommonModule, CourseSectionsTableComponent],
  templateUrl: './course-section-management.component.html',
  styleUrls: ['./course-section-management.component.scss'],
})
export class CourseSectionManagementComponent {}
