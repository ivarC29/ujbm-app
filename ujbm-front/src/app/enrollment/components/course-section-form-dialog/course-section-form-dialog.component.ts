import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';

import { CourseSectionService } from '../../service/course-section.service';
import { ApplicantService } from '../../../applicant/services/applicant.service';
import { 
  CourseSelectResponse, 
  TeacherAutocompleteResponse, 
  AcademicPeriodSelectResponse,
  CourseSectionRequest, 
  CourseSectionResponse,
  DayOfWeek, 
  WeeklyScheduleRequest 
} from '../../interfaces/course-section.interface';

@Component({
  selector: 'app-course-section-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ChipModule,
    CalendarModule,
    TableModule,
    CardModule,
    AutoCompleteModule,
    DropdownModule,
    DatePickerModule,
    SelectModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './course-section-form-dialog.component.html',
  styleUrls: ['./course-section-form-dialog.component.scss']
})
export class CourseSectionFormDialogComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() sectionId?: number;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private courseSectionService = inject(CourseSectionService);
  private applicantService = inject(ApplicantService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  filtersForm!: FormGroup;
  loading: boolean = false;
  
  // Dropdown data
  courses: CourseSelectResponse[] = [];
  filteredTeachers: TeacherAutocompleteResponse[] = [];
  allTeachers: TeacherAutocompleteResponse[] = [];
  periods: AcademicPeriodSelectResponse[] = [];
  programs: any[] = [];
  
  // Horarios
  weeklySchedules: WeeklyScheduleRequest[] = [];
  availableDays = Object.values(DayOfWeek);
  cycles = Array.from({length: 10}, (_, i) => ({ label: `Ciclo ${i + 1}`, value: i + 1 }));
  isAddingSchedule: boolean = false;

  get isEditMode(): boolean {
    return !!this.sectionId;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Sección' : 'Nueva Sección';
  }

  ngOnInit(): void {
    this.initForms();
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.isEditMode) {
        this.loadSectionDetails();
      } else {
        this.resetForm();
      }
    }
    
    if (changes['sectionId'] && changes['sectionId'].currentValue && this.visible) {
      this.loadSectionDetails();
    }
  }

  private initForms(): void {
    this.filtersForm = this.fb.group({
      programId: [null],
      cycle: [null]
    });

    this.form = this.fb.group({
      courseId: [null, Validators.required],
      section: ['', [Validators.required, Validators.maxLength(10)]],
      teacherId: [null, Validators.required],
      teacherSelection: [null], // ✅ Para el autocomplete
      vacancies: [null, [Validators.required, Validators.min(1), Validators.max(200)]],
      academicPeriodId: [null, Validators.required],
      
      newSchedule: this.fb.group({
        day: [null],
        startTime: [null],
        endTime: [null]
      })
    });

    this.filtersForm.valueChanges.subscribe(() => {
      this.filterCourses();
    });

    this.form.get('teacherSelection')?.valueChanges.subscribe(teacher => {
      if (teacher && teacher.id) {
        this.form.get('teacherId')?.setValue(teacher.id);
      } else if (!teacher) {
        this.form.get('teacherId')?.setValue(null);
      }
    });
  }

  private loadInitialData(): void {
    this.loadPrograms();
    this.loadCourses();
    this.loadPeriods();
    this.preloadTeachers();
  }

  private loadPrograms(): void {
    this.applicantService.getPrograms().subscribe({
      next: (programs) => {
        this.programs = programs.map(program => ({
          label: program.name,
          value: program.id
        }));
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.showError('No se pudieron cargar los programas');
      }
    });
  }

  private loadCourses(): void {
    this.courseSectionService.getCoursesForSelect().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.showError('No se pudieron cargar los cursos');
      }
    });
  }

  private loadPeriods(): void {
    this.courseSectionService.getPeriodsForSelect().subscribe({
      next: (periods) => {
        this.periods = periods;
      },
      error: (error) => {
        console.error('Error loading periods:', error);
        this.showError('No se pudieron cargar los períodos académicos');
      }
    });
  }

  private preloadTeachers(): void {
    this.courseSectionService.getTeachersAutocomplete('').subscribe({
      next: (teachers) => {
        this.allTeachers = teachers;
        this.filteredTeachers = teachers.slice(0, 10);
      },
      error: (error) => {
        console.error('Error preloading teachers:', error);
        this.courseSectionService.getTeachersAutocomplete('a').subscribe({
          next: (teachers) => {
            this.allTeachers = teachers;
            this.filteredTeachers = teachers.slice(0, 10);
          },
          error: () => {
            this.allTeachers = [];
            this.filteredTeachers = [];
          }
        });
      }
    });
  }

  private loadSectionDetails(): void {
    if (!this.sectionId) return;

    this.loading = true;
    this.courseSectionService.getCourseSectionById(this.sectionId).subscribe({
      next: (section: CourseSectionResponse) => {
        this.populateForm(section);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading section details:', error);
        this.showError('No se pudo cargar la información de la sección');
        this.loading = false;
      }
    });
  }

 private populateForm(section: CourseSectionResponse): void {
  if (section.course) {
    this.filtersForm.patchValue({
      programId: section.course.programId,
      cycle: section.course.cycle
    });
    this.filterCourses();
  }

  
  this.form.patchValue({
    courseId: section.course.id,
    section: section.section,
    teacherId: section.teacherId,
    vacancies: section.vacancies,
    academicPeriodId: section.academicPeriodId
  });

  
  const teacherObj = {
    id: section.teacherId,
    fullName: section.teacherName || ''
  };
  this.form.get('teacherSelection')?.setValue(teacherObj);

  
  if (!this.allTeachers.find(t => t.id === section.teacherId)) {
    this.allTeachers.push(teacherObj);
  }

  
  if (section.weeklySchedules && section.weeklySchedules.length > 0) {
    this.weeklySchedules = section.weeklySchedules.map(schedule => ({
      day: schedule.day.toString(),
      startTime: this.formatTimeForEdit(schedule.startTime),
      endTime: this.formatTimeForEdit(schedule.endTime)
    }));
  }
}
  private formatTimeForEdit(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  filterCourses(): void {
    const programId = this.filtersForm.get('programId')?.value;
    const cycle = this.filtersForm.get('cycle')?.value;

    if (programId && cycle) {
      this.loading = true;
      this.courseSectionService.getCoursesForSelectByProgramAndCycle(programId, cycle).subscribe({
        next: (courses) => {
          this.courses = courses;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error filtering courses:', error);
          this.showError('No se pudieron filtrar los cursos');
          this.loading = false;
        }
      });
    } else {
      this.loadCourses();
    }
  }

  searchTeachers(event: any): void {
    const query = event.query?.trim().toLowerCase() || '';
    
    if (query.length >= 1) {
      const localFiltered = this.allTeachers.filter(teacher =>
        teacher.fullName.toLowerCase().includes(query)
      );

      if (localFiltered.length > 0) {
        this.filteredTeachers = localFiltered.slice(0, 20);
      } else {
        this.courseSectionService.getTeachersAutocomplete(query).subscribe({
          next: (teachers) => {
            this.filteredTeachers = teachers;
            teachers.forEach(teacher => {
              if (!this.allTeachers.find(t => t.id === teacher.id)) {
                this.allTeachers.push(teacher);
              }
            });
          },
          error: (error) => {
            console.error('Error searching teachers:', error);
            this.filteredTeachers = [];
          }
        });
      }
    } else {
      this.filteredTeachers = this.allTeachers.slice(0, 10);
    }
  }

  onTeacherSelect(event: any): void {
    const teacher = event.value;
    if (teacher) {
      this.form.get('teacherId')?.setValue(teacher.id);
    }
  }

  onTeacherClear(): void {
    this.form.get('teacherId')?.setValue(null);
    this.form.get('teacherSelection')?.setValue(null);
  }

  selectDay(day: DayOfWeek): void {
    this.form.get('newSchedule.day')?.setValue(day);
  }

  getDayLabel(day: string): string {
    const labels: Record<string, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return labels[day] || day;
  }

  getDayAbbreviation(day: string): string {
    const abbreviations: Record<string, string> = {
      'MONDAY': 'L',
      'TUESDAY': 'M',
      'WEDNESDAY': 'MI',
      'THURSDAY': 'J',
      'FRIDAY': 'V',
      'SATURDAY': 'S',
      'SUNDAY': 'D'
    };
    return abbreviations[day] || day;
  }

  startAddingSchedule(): void {
    this.isAddingSchedule = true;
    // Inicializa el formGroup de horario con 00:00
    const zeroDate = new Date();
    zeroDate.setHours(0, 0, 0, 0);
    this.form.get('newSchedule')?.setValue({
      day: null,
      startTime: zeroDate,
      endTime: zeroDate
    });
}

  cancelAddingSchedule(): void {
    this.isAddingSchedule = false;
    this.form.get('newSchedule')?.reset();
  }

  getMinTime(): Date {
    const date = new Date();
    date.setHours(6, 0, 0, 0); 
    return date;
  }

  getMaxTime(): Date {
    const date = new Date();
    date.setHours(22, 0, 0, 0);
    return date;
  }

  addSchedule(): void {
    const newScheduleForm = this.form.get('newSchedule');
    const day = newScheduleForm?.get('day')?.value;
    let startTime = newScheduleForm?.get('startTime')?.value;
    let endTime = newScheduleForm?.get('endTime')?.value;

    if (!day || !startTime || !endTime) {
      this.showError('Debe completar todos los campos del horario');
      return;
    }

    // Normalizar los minutos a múltiplos de 15
    startTime = this.normalizeTimeToQuarterHour(startTime);
    endTime = this.normalizeTimeToQuarterHour(endTime);

    if (this.timeToMinutes(startTime) >= this.timeToMinutes(endTime)) {
      this.showError('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }


    const hasConflict = this.weeklySchedules.some(schedule => 
      schedule.day === day && this.hasTimeOverlap(
        { start: startTime, end: endTime },
        { start: schedule.startTime, end: schedule.endTime }
      )
    );

    if (hasConflict) {
      this.showError('Ya existe un horario que se superpone en ese día');
      return;
    }

    this.weeklySchedules.push({
      day: day,
      startTime,
      endTime
    });

    this.sortSchedules();
    newScheduleForm?.reset();
    this.isAddingSchedule = false;
    this.showSuccess('Horario agregado correctamente');
  }

  private normalizeTimeToQuarterHour(time: any): string {
  if (!time) return '';
  
  let hours: number, minutes: number;
  
  if (time instanceof Date) {
    hours = time.getHours();
    minutes = time.getMinutes();
  } else if (typeof time === 'string') {
    const [h, m] = time.split(':').map(Number);
    hours = h;
    minutes = m;
  } else {
    return '';
  }
  
  
  const roundedMinutes = Math.round(minutes / 15) * 15;
  
  // Si los minutos se redondean a 60, aumentar la hora
  if (roundedMinutes === 60) {
    hours++;
    minutes = 0;
  } else {
    minutes = roundedMinutes;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

  removeSchedule(index: number): void {
    this.weeklySchedules.splice(index, 1);
    this.showSuccess('Horario eliminado');
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private hasTimeOverlap(time1: {start: string, end: string}, time2: {start: string, end: string}): boolean {
    const start1 = this.timeToMinutes(time1.start);
    const end1 = this.timeToMinutes(time1.end);
    const start2 = this.timeToMinutes(time2.start);
    const end2 = this.timeToMinutes(time2.end);

    return start1 < end2 && start2 < end1;
  }

  private sortSchedules(): void {
    const dayOrder: Record<string, number> = {
      'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4,
      'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7
    };

    this.weeklySchedules.sort((a, b) => {
      const dayDiff = dayOrder[a.day] - dayOrder[b.day];
      if (dayDiff !== 0) return dayDiff;
      return this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime);
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Campo requerido';
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    
    return 'Campo inválido';
  }

  saveSection(): void {
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      this.showError('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.weeklySchedules.length === 0) {
      this.showError('Debe agregar al menos un horario');
      return;
    }

    this.loading = true;

    const formValue = this.form.value;
    const sectionData: CourseSectionRequest = {
      courseId: Number(formValue.courseId),
      section: formValue.section.trim(),
      teacherId: Number(formValue.teacherId),
      vacancies: Number(formValue.vacancies),
      academicPeriodId: Number(formValue.academicPeriodId),
      weeklySchedules: this.weeklySchedules
    };

    const operation = this.isEditMode 
      ? this.courseSectionService.updateCourseSection(this.sectionId!, sectionData)
      : this.courseSectionService.createCourseSection(sectionData);

    operation.subscribe({
      next: () => {
        this.showSuccess(
          this.isEditMode 
            ? 'Sección actualizada correctamente' 
            : 'Sección creada correctamente'
        );
        this.loading = false;
        this.saved.emit();
        this.hideDialog();
      },
      error: (error) => {
      console.error('Error saving section:', error);
      
      let errorMessage = `No se pudo ${this.isEditMode ? 'actualizar' : 'crear'} la sección`;
      
      // Obtener el mensaje del backend
      const backendMsg = error?.error?.message || error?.message || '';
      const lowerMsg = backendMsg.toLowerCase();
      
      // Manejar errores específicos
      if (lowerMsg.includes('ya existe una sección con el nombre') || 
          lowerMsg.includes('duplicate') || 
          lowerMsg.includes('duplicada')) {
        errorMessage = 'Ya existe una sección con ese nombre para este curso y período académico. Por favor, use un nombre diferente.';
      } else if (lowerMsg.includes('teacher') && lowerMsg.includes('conflict')) {
        errorMessage = 'El docente ya tiene asignada otra sección en el mismo horario.';
      } else if (lowerMsg.includes('schedule') && lowerMsg.includes('conflict')) {
        errorMessage = 'Existe un conflicto de horarios con otra sección.';
      } else if (backendMsg) {
        errorMessage = backendMsg;
      }
      
      this.showError(errorMessage);
      this.loading = false;
    }
  });
}

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset();
    this.filtersForm.reset();
    this.weeklySchedules = [];
    this.isAddingSchedule = false;
    this.filteredTeachers = this.allTeachers.slice(0, 10);
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}