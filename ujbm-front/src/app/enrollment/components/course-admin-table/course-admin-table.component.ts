import { Component, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CourseAdminService } from '../../service/course-admin.service';
import { CourseResponse, CoursePage, CourseFilterRequest } from '../../interfaces/course-admin.interface';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgramResponse } from '@shared/interfaces/program.interfaces';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { CourseAdminFormDialogComponent } from "../course-admin-form-dialog/course-admin-form-dialog.component";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BaseTableComponent } from '@shared/utils/base-table.component';

@Component({
  selector: 'app-course-admin-table',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    SelectModule,
    InputTextModule,
    SkeletonModule,
    CourseAdminFormDialogComponent,
    ConfirmDialogModule,
    ToastModule
],
  providers: [MessageService, ConfirmationService],
  templateUrl:'./course-admin-table.component.html',
  styleUrls: ['./course-admin-table.component.scss']
})
export class CourseAdminTableComponent extends BaseTableComponent<CourseResponse, CourseFilterRequest> implements OnInit {
  programs = signal<ProgramResponse[]>([]);
  loadingPrograms = signal<boolean>(false);
  
  formDialogVisible = false;
  courseToEdit: CourseResponse | null = null;

  constructor(
    messageService: MessageService,
    confirmationService: ConfirmationService,
    private courseService: CourseAdminService,
    private applicantService: ApplicantService
  ) {
    super(messageService, confirmationService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadPrograms();
  }

  
  getInitialFilter(): CourseFilterRequest {
    return {
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDirection: 'ASC'
    };
  }

  loadItems(): void {
    if (this.isProcessingAction) return;

    this.isProcessingAction = true;
    this.loading.set(true);
    this.currentFilter.size = this.rows;

    this.courseService.filterCourses(this.currentFilter).subscribe({
      next: (response: CoursePage) => {
        this.items.set(response.content); 
        this.totalRecords = response.page.totalElements;
        this.loading.set(false);
        this.isProcessingAction = false;
      },
      error: (error) => {
        console.error('Error cargando cursos:', error);
        this.loading.set(false);
        this.isProcessingAction = false;
      }
    });
  }

  deleteItem(course: CourseResponse): void {
    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        this.showSuccessMessage(
          'Curso Eliminado',
          `El curso "${course.name}" ha sido eliminado exitosamente`
        );
        this.loadItems();
      },
      error: (error) => {
        console.error('Error eliminando curso:', error);
        this.showErrorMessage(
          'Error al Eliminar',
          error.error?.message || 'Error al eliminar el curso. Inténtalo de nuevo.'
        );
      }
    });
  }

  getItemDisplayName(course: CourseResponse): string {
    return course.name;
  }

  //  Métodos específicos de cursos
  private loadPrograms(): void {
    this.loadingPrograms.set(true);
    this.applicantService.getPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
        this.loadingPrograms.set(false);
      },
      error: (error) => {
        console.error('Error cargando programas:', error);
        this.loadingPrograms.set(false);
      }
    });
  }

  onProgramFilterChange(event: any): void {
    const programId = event.value;
    this.onColumnFilter('programId', programId);
  }

  // métodos del dialog
  onCreateCourse(): void {
    this.courseToEdit = null;
    this.formDialogVisible = true;
  }

  onEditCourse(course: CourseResponse): void {
    this.courseToEdit = course;
    this.formDialogVisible = true;
  }

  //método de la clase base para eliminar
  onDeleteCourse(course: CourseResponse): void {
    this.onDeleteWithConfirmation(course);
  }

  onCourseCreated(error?: any): void {
    this.formDialogVisible = false;
    this.courseToEdit = null;
    this.loadItems();
    if (error) {
    this.handleCourseError(error);
  } else {
    this.loadItems();
  }
  }

  onCourseUpdated(error?: any): void {
    this.formDialogVisible = false;
    this.courseToEdit = null;
    this.loadItems();
    if (error) {
    this.handleCourseError(error);
  } else {
    this.loadItems();
  }
  }

  onDialogClose(): void {
    this.formDialogVisible = false;
  }

  getProgramName(programId: number): string {
    const program = this.programs().find(p => p.id === programId);
    return program ? program.name : `Programa ${programId}`;
  }

  //Sobrescribir filtros 
  protected override applyColumnFilter(field: string, value: any): void {
  const filterValue = value?.trim ? value.trim() : value;

  switch (field) {
    case 'code':
    case 'name':
      if (filterValue && filterValue !== '') {
        (this.currentFilter as CourseFilterRequest)[field] = filterValue;
      } else {
        delete (this.currentFilter as CourseFilterRequest)[field];
      }
      break;
    case 'credits':
    case 'cycle':
    case 'programId':
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        (this.currentFilter as CourseFilterRequest)[field] = Number(filterValue);
      } else {
        delete (this.currentFilter as CourseFilterRequest)[field];
      }
      break;
    default:
      console.warn(`Filtro no reconocido: ${field}`);
      return;
  }
}

private handleCourseError(error: any): void {
  let errorMsg = 'Error al guardar el curso. Inténtalo de nuevo.';
  let errorSummary = 'Error';

  const backendMsg = error?.error?.message || error?.message || '';

  if (backendMsg.includes('Ya existe un curso con el código')) {
    errorSummary = 'Código duplicado';
    errorMsg = backendMsg;
  }

  this.showErrorMessage(errorSummary, errorMsg);
}

  // para que quede con el template de la tabla
  get courses() {
    return this.items; 
  }
}