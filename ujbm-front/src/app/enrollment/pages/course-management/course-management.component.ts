import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseAdminTableComponent } from '../../components/course-admin-table/course-admin-table.component';
import { CourseAdminFormDialogComponent } from '../../components/course-admin-form-dialog/course-admin-form-dialog.component';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    CommonModule,
    CourseAdminTableComponent,
    CourseAdminFormDialogComponent
  ],
  template: `
    <div class="card course-management-pagemin-h-screen px-0 md:px-8 py-8">
        <app-course-admin-table 
          #courseTable
          (openFormDialog)="onOpenFormDialog()">
        </app-course-admin-table>

        <app-course-admin-form-dialog 
          [visible]="showFormDialog()"
          (visibleChange)="onFormDialogVisibleChange($event)"
          (courseCreated)="onCourseCreated()">
        </app-course-admin-form-dialog>
    </div>
  `,
  styles: [`
    .course-management-page {
      min-height: 100vh;
      padding: 0;
    }
    @media (max-width: 768px) {
      .card-main {
        padding: 0.5rem !important;
        border-radius: 1rem;
      }
      .course-management-page {
        padding: 0 !important;
      }
    }
  `]
})
export default class CourseManagementComponent {
  @ViewChild('courseTable') courseTable!: CourseAdminTableComponent;
  
  showFormDialog = signal<boolean>(false);

  onOpenFormDialog(): void {
    this.showFormDialog.set(true);
  }

  onFormDialogVisibleChange(visible: boolean): void {
    this.showFormDialog.set(visible);
  }

  onCourseCreated(): void {
    this.courseTable.refreshTable();
  }
}
