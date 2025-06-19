import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { BaseTableComponent } from '@shared/utils/base-table.component';
import { TeacherService } from '../../services/teacher-service';
import { 
  TeacherTableInfoResponse, 
  TeacherFilterRequest, 
  TeacherPage 
} from '../../interfaces/teacher.interfaces';
import { TeacherFormDialogComponent } from '../teacher-form-dialog/teacher-form-dialog.component';

@Component({
  selector: 'app-teacher-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    SkeletonModule, 
    TeacherFormDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './teacher-table.component.html',
  styleUrl: './teacher-table.component.scss'
})
export class TeacherTableComponent extends BaseTableComponent<TeacherTableInfoResponse, TeacherFilterRequest> {
  
  // Dialog properties
  formDialogVisible = false;
  teacherToEdit: TeacherTableInfoResponse | null = null;

  constructor(
    messageService: MessageService,
    confirmationService: ConfirmationService,
    private teacherService: TeacherService
  ) {
    super(messageService, confirmationService);
  }

  // mapeo de campos frontend a backend
  private readonly sortFieldMapping: { [key: string]: string } = {
    'name': 'person.name',
    'email': 'person.email',
    'code': 'code',
    'professionalTitle': 'professionalTitle',
    'academicDegree': 'academicDegree'
  };

  getInitialFilter(): TeacherFilterRequest {
    return {
      page: 0,
      size: 10,
      sortBy: 'person.name', 
      sortDirection: 'ASC'
    };
  }

  loadItems(): void {
    if (this.isProcessingAction) return;

    this.isProcessingAction = true;
    this.loading.set(true);
    this.currentFilter.size = this.rows;

    this.teacherService.filterTeachers(this.currentFilter).subscribe({
      next: (response: TeacherPage) => {
        this.items.set(response.content);
        this.totalRecords = response.page.totalElements;
        this.loading.set(false);
        this.isProcessingAction = false;
      },
      error: (error) => {
        console.error('Error cargando profesores:', error);
        this.showErrorMessage(
          'Error', 
          `No se pudieron cargar los profesores. Status: ${error.status}`
        );
        this.loading.set(false);
        this.isProcessingAction = false;
      }
    });
  }

  deleteItem(teacher: TeacherTableInfoResponse): void {
    this.teacherService.deleteTeacher(teacher.id).subscribe({
      next: () => {
        this.showSuccessMessage(
          'Docente Eliminado',
          `${teacher.name} ${teacher.lastname} ha sido eliminado exitosamente`
        );
        this.loadItems();
      },
      error: (error) => {
        console.error('Error eliminando profesor:', error);
        this.showErrorMessage(
          'Error al Eliminar',
          error.error?.message || 'Error al eliminar el docente. Inténtalo de nuevo.'
        );
      }
    });
  }

  getItemDisplayName(teacher: TeacherTableInfoResponse): string {
    return `${teacher.name} ${teacher.lastname}`;
  }

  // onSort para mapear campos
  override onSort(event: any): void {
    if (this.isProcessingAction) return;

    const frontendField = event.field;
    const backendField = this.sortFieldMapping[frontendField] || frontendField;
    const newSortDirection = event.order === 1 ? 'ASC' : 'DESC';

    if (this.currentFilter.sortBy !== backendField || this.currentFilter.sortDirection !== newSortDirection) {
      this.currentFilter.sortBy = backendField;
      this.currentFilter.sortDirection = newSortDirection;
      this.resetPagination();
      this.loadItems();
    }
  }

  // métodos del dialog
  onCreateTeacher(): void {
    this.teacherToEdit = null;
    this.formDialogVisible = true;
  }

  onEditTeacher(teacher: TeacherTableInfoResponse): void {
    this.teacherToEdit = teacher;
    this.formDialogVisible = true;
  }

  onDeleteTeacher(teacher: TeacherTableInfoResponse): void {
    this.onDeleteWithConfirmation(teacher);
  }

  onTeacherSaved(): void {
    this.formDialogVisible = false;
    this.teacherToEdit = null;
    this.loadItems();
  }

  protected override applyGlobalFilter(searchValue: string): void {
    this.currentFilter.fullName = searchValue;
  }

  protected override clearGlobalFilter(): void {
    delete this.currentFilter.fullName;
  }

  protected override applyColumnFilter(field: string, value: any): void {
    const filterValue = value?.trim ? value.trim() : value;

    switch (field) {
      case 'fullName':
      case 'email':
      case 'code':
      case 'professionalTitle':
      case 'academicDegree':
        if (filterValue && filterValue !== '') {
          (this.currentFilter as TeacherFilterRequest)[field] = filterValue;
        } else {
          delete (this.currentFilter as TeacherFilterRequest)[field];
        }
        break;
      default:
        super.applyColumnFilter(field, value);
        return;
    }
  }

  // compatibilidad con el template
  get teachers() {
    return this.items;
  }
}