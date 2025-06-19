import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';

import { BaseTableComponent } from '@shared/utils/base-table.component';
import { CourseSectionService } from '../../service/course-section.service';
import { 
  CourseSectionTableInfoResponse,
  CourseSectionFilterRequest,
  CourseSectionPage,
  CourseSectionBatchUploadResponse,
  AcademicPeriodSelectResponse,
  WeeklyScheduleResponse
} from '../../interfaces/course-section.interface';
import { CourseSectionFormDialogComponent } from '../course-section-form-dialog/course-section-form-dialog.component';
import { CourseSectionUploadDialogComponent } from '../course-section-upload-dialog/course-section-upload-dialog.component';

@Component({
  selector: 'app-course-sections-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TagModule,
    DropdownModule,
    MultiSelectModule,
    DialogModule,
    ConfirmDialogModule,
    PaginatorModule,
    ToolbarModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    SelectModule,
    CourseSectionFormDialogComponent,
    CourseSectionUploadDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './course-sections-table.component.html',
  styleUrls: ['./course-sections-table.component.scss']
})
export class CourseSectionsTableComponent extends BaseTableComponent<CourseSectionTableInfoResponse, CourseSectionFilterRequest> {
  
  formDialogVisible = false;
  uploadDialogVisible = false;
  selectedSectionId?: number;

  periods = signal<AcademicPeriodSelectResponse[]>([]);

  constructor(
    messageService: MessageService,
    confirmationService: ConfirmationService,
    private courseSectionService: CourseSectionService
  ) {
    super(messageService, confirmationService);
  }

  private readonly sortFieldMapping: { [key: string]: string } = {
    'courseName': 'course.name',
    'section': 'section',
    'teacherName': 'teacher.person.name',
    'vacancies': 'vacancies',
    'periodName': 'periodId'
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadDropdownData();
  }

  getInitialFilter(): CourseSectionFilterRequest {
    return {
      page: 0,
      size: 10,
      sortBy: 'course.name',
      sortDirection: 'ASC'
    };
  }

  loadItems(): void {
    if (this.isProcessingAction) return;

    this.isProcessingAction = true;
    this.loading.set(true);
    
    const filterRequest: CourseSectionFilterRequest = {
      page: this.currentFilter.page || 0,
      size: this.rows,
      sortBy: this.currentFilter.sortBy || 'courseName',
      sortDirection: this.currentFilter.sortDirection || 'ASC'
    };

    if (this.currentFilter.courseName) {
      filterRequest.courseName = this.currentFilter.courseName;
    }
    if (this.currentFilter.section) {
      filterRequest.section = this.currentFilter.section;
    }
    if (this.currentFilter.teacherName) {
      filterRequest.teacherName = this.currentFilter.teacherName;
    }
    if (this.currentFilter.courseId) {
      filterRequest.courseId = this.currentFilter.courseId;
    }
    if (this.currentFilter.teacherId) {
      filterRequest.teacherId = this.currentFilter.teacherId;
    }
    if (this.currentFilter.periodId) {
      filterRequest.periodId = this.currentFilter.periodId;
    }
    if (this.currentFilter.vacancies) {
      filterRequest.vacancies = this.currentFilter.vacancies;
    }


    this.courseSectionService.filterCourseSections(filterRequest).subscribe({
      next: (response: CourseSectionPage) => {
        
        const mappedContent = response.content.map(section => ({
          ...section,
          name: section.courseName 
        }));

        this.items.set(mappedContent);
        this.totalRecords = response.page.totalElements;
        this.loading.set(false);
        this.isProcessingAction = false;
      },
      error: (error) => {
        this.showErrorMessage(
          'Error', 
          `No se pudieron cargar las secciones. ${error.error?.message || error.message || ''}`
        );
        this.loading.set(false);
        this.isProcessingAction = false;
      }
    });
  }

  deleteItem(section: CourseSectionTableInfoResponse): void {
    this.courseSectionService.deleteCourseSection(section.id).subscribe({
      next: () => {
        this.showSuccessMessage(
          'Sección Eliminada',
          `La sección ${section.section} del curso ${section.courseName} ha sido eliminada exitosamente`
        );
        this.loadItems();
      },
      error: (error) => {
        console.error('Error eliminando sección:', error);
        this.showErrorMessage(
          'Error al Eliminar',
          error.error?.message || 'Error al eliminar la sección. Inténtalo de nuevo.'
        );
      }
    });
  }

  getItemDisplayName(section: CourseSectionTableInfoResponse): string {
    return `${section.courseName} - Sección ${section.section}`;
  }

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

  protected override applyGlobalFilter(searchValue: string): void {
    this.currentFilter.courseName = searchValue;
  }

  protected override clearGlobalFilter(): void {
    delete this.currentFilter.courseName;
  }

  protected override applyColumnFilter(field: string, value: any): void {
    const filterValue = value?.trim ? value.trim() : value;

    switch (field) {
      case 'courseName':
      case 'section':
      case 'teacherName':
        if (filterValue && filterValue !== '') {
          (this.currentFilter as any)[field] = filterValue;
        } else {
          delete (this.currentFilter as any)[field];
        }
        break;
      case 'courseId':
      case 'teacherId':
      case 'periodId':
      case 'vacancies':
        if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
          (this.currentFilter as any)[field] = Number(filterValue);
        } else {
          delete (this.currentFilter as any)[field];
        }
        break;
      default:
        super.applyColumnFilter(field, value);
        return;
    }
  }

  private loadDropdownData(): void {
    // Solo cargar períodos académicos
    this.courseSectionService.getPeriodsForSelect().subscribe({
      next: (periods) => this.periods.set(periods),
      error: (error) => console.error('Error loading periods:', error)
    });
  }

  onPeriodFilterChange(event: any): void {
    const periodId = event.value;
    this.onColumnFilter('periodId', periodId);
  }

  onCreateSection(): void {
    this.selectedSectionId = undefined;
    this.formDialogVisible = true;
  }

  onEditSection(section: CourseSectionTableInfoResponse): void {
    this.selectedSectionId = section.id;
    this.formDialogVisible = true;
  }

  onDeleteSection(section: CourseSectionTableInfoResponse): void {
    this.onDeleteWithConfirmation(section);
  }

  onSectionSaved(): void {
    this.formDialogVisible = false;
    this.selectedSectionId = undefined;
    this.loadItems();
  }

  onOpenUploadDialog(): void {
    this.uploadDialogVisible = true;
  }

  onBatchUploaded(response: CourseSectionBatchUploadResponse): void {
    this.uploadDialogVisible = false;
    this.loadItems();
    
    this.showSuccessMessage(
      'Carga Masiva Completada',
      `Procesados: ${response.totalRecords}, Exitosos: ${response.successCount}, Errores: ${response.errorCount}`
    );

    if (response.errors && response.errors.length > 0) {
      response.errors.forEach(error => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Error en fila',
          detail: error,
          life: 5000
        });
      });
    }
  }

  get courseSections() {
    return this.items;
  }

  formatTime(time: string): string {
    return this.courseSectionService.formatTime(time);
  }

  getDayAbbreviation(day: string): string {
    return this.courseSectionService.getDayAbbreviation(day);
  }

  getGroupedSchedules(weeklyScheduleList: WeeklyScheduleResponse[]): { day: string, times: string }[] {
    if (!weeklyScheduleList || weeklyScheduleList.length === 0) {
      return [];
    }

    const schedulesByDay = weeklyScheduleList.reduce((acc, schedule) => {
      const day = schedule.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(schedule);
      return acc;
    }, {} as Record<string, WeeklyScheduleResponse[]>);

    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
    return dayOrder
      .filter(day => schedulesByDay[day])
      .map(day => ({
        day: this.getDayAbbreviation(day),
        times: schedulesByDay[day]
          .map((s: WeeklyScheduleResponse) => `${this.formatTime(s.startTime)}-${this.formatTime(s.endTime)}`)
          .join(', ')
      }));
  }
}
