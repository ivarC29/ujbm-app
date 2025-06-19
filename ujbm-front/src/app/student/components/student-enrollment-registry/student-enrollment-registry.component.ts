import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { EnrollmentStatusWithAvailableCourseSectionsResponse, CourseSectionWithDetailStatusResponse, EnrollmentRequest} from '../../interfaces/student-enrollment.interfaces';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

export type EnrollmentStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

interface GroupedCourse {
  course: any;
  sections: CourseSectionWithDetailStatusResponse[];
}

@Component({
  selector: 'app-student-enrollment-registry',
  templateUrl: './student-enrollment-registry.component.html',
  styleUrl: './student-enrollment-registry.component.scss',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TableModule, ToastModule],
  providers: [MessageService]
})
export class StudentEnrollmentRegistryComponent implements OnInit {
  data?: EnrollmentStatusWithAvailableCourseSectionsResponse;
  groupedCourses: GroupedCourse[] = [];
  enrolledDetails: CourseSectionWithDetailStatusResponse[] = [];
  selectedCourse: GroupedCourse | null = null;
  dialogVisible = false;
  selectedSection: CourseSectionWithDetailStatusResponse | null = null;
  isRegistering: boolean = false;

  layout: 'list' | 'grid' = 'list';

  // Status message handling
  canEnroll: boolean = false;
  statusMessage: string = '';
  isLoading: boolean = true;

  constructor(
    private studentService: StudentService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

   toggleLayout(): void {
    this.layout = this.layout === 'list' ? 'grid' : 'list';
  }

  loadData() {
    this.isLoading = true;
    this.studentService.getAvailableCourseSections().subscribe({
      next: (res) => {
        this.data = res;
        this.handleEnrollmentStatus(res);
        this.groupedCourses = this.groupByCourse(res.availableSections);
        this.loadEnrolledFromStorage();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading available course sections:', error);
        this.isLoading = false;
        this.canEnroll = false;
        this.statusMessage = 'Error al cargar las secciones disponibles. Por favor, inténtelo más tarde.';
      }
    });
  }

  private handleEnrollmentStatus(response: EnrollmentStatusWithAvailableCourseSectionsResponse): void {
    switch (response.enrollmentStatus) {
      case 'DRAFT':
      case 'CANCELLED':
        this.canEnroll = true;
        break;
        
      case 'PENDING':
        this.canEnroll = false;
        this.statusMessage = `Tu matrícula se encuentra en estado PENDIENTE de confirmación. 
                             Por favor, espera a que sea procesada por el área académica. 
                             Una vez confirmada, podrás visualizar tus cursos matriculados.`;
        break;
        
      case 'CONFIRMED':
        this.canEnroll = false;
        this.statusMessage = `Tu matrícula ya ha sido CONFIRMADA para el período ${response.academicPeriodName}. 
                             No puedes realizar modificaciones. Si necesitas hacer cambios, 
                             contacta al área académica.`;
        break;
        
      default:
        this.canEnroll = false;
        this.statusMessage = `Tu matrícula se encuentra en un estado que no permite realizar inscripciones. 
                             Contacta al área académica para más información.`;
        break;
    }
  }

  groupByCourse(sections: CourseSectionWithDetailStatusResponse[]): GroupedCourse[] {
    const map = new Map<number, GroupedCourse>();
    for (const s of sections) {
      const courseId = s.courseSection.course.id;
      if (!map.has(courseId)) {
        map.set(courseId, {
          course: s.courseSection.course,
          sections: []
        });
      }
      map.get(courseId)!.sections.push(s);
    }
    return Array.from(map.values());
  }

  openDialog(course: GroupedCourse) {
    if (!this.canEnroll) return;
    this.selectedCourse = course;
    this.dialogVisible = true;
    this.selectedSection = null;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.selectedCourse = null;
    this.selectedSection = null;
  }

  selectSection(section: CourseSectionWithDetailStatusResponse) {
    this.selectedSection = section;
  }
  
    getEnrolledDetailId(courseId: number): number {
      const found = this.enrolledDetails.find(e => e.courseSection.course.id === courseId);
      return found?.enrollmentDetailId || 0;
    }
  enrollSelectedSection() {
    if (!this.selectedSection) return;
    
    // Validar conflicto de horario
    if (this.hasScheduleConflict(this.selectedSection)) {
      alert('Esta sección tiene conflicto de horario con una sección ya inscrita.');
      return;
    }

    // Validar si ya está inscrito en este curso
    const alreadyEnrolled = this.isEnrolledInCourse(this.selectedSection.courseSection.course.id);
    if (alreadyEnrolled) {
      alert('Ya estás inscrito en una sección de este curso.');
      return;
    }

    // Guardar en localStorage
    this.enrolledDetails.push(this.selectedSection);
    this.saveEnrolledToStorage();
    this.closeDialog();
  }

  removeEnrolled(detailId: number) {
    if (!this.canEnroll) return;
    this.enrolledDetails = this.enrolledDetails.filter(e => e.enrollmentDetailId !== detailId);
    this.saveEnrolledToStorage();
  }

  isEnrolledInCourse(courseId: number): boolean {
    return this.enrolledDetails.some(e => e.courseSection.course.id === courseId);
  }

  hasScheduleConflict(section: CourseSectionWithDetailStatusResponse): boolean {
    for (const enrolled of this.enrolledDetails) {
      for (const ws1 of enrolled.courseSection.weeklySchedules) {
        for (const ws2 of section.courseSection.weeklySchedules) {
          if (ws1.day === ws2.day) {
            const start1 = this.timeToMinutes(ws1.startTime);
            const end1 = this.timeToMinutes(ws1.endTime);
            const start2 = this.timeToMinutes(ws2.startTime);
            const end2 = this.timeToMinutes(ws2.endTime);
            
            if ((start1 < end2) && (start2 < end1)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  saveEnrolledToStorage() {
    const enrolledIds = this.enrolledDetails.map(e => e.enrollmentDetailId);
    localStorage.setItem('enrolledDetails', JSON.stringify(enrolledIds));
  }

  loadEnrolledFromStorage() {
    const ids = JSON.parse(localStorage.getItem('enrolledDetails') || '[]');
    this.enrolledDetails = [];
    if (this.data && this.data.availableSections) {
      this.enrolledDetails = this.data.availableSections.filter(e => ids.includes(e.enrollmentDetailId));
    }
  }

  canRegister(): boolean {
    return this.enrolledDetails.length >= 4;
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  getDayAbbreviation(day: string): string {
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'LUN',
      'TUESDAY': 'MAR', 
      'WEDNESDAY': 'MIÉ',
      'THURSDAY': 'JUE',
      'FRIDAY': 'VIE',
      'SATURDAY': 'SÁB',
      'SUNDAY': 'DOM'
    };
    return dayMap[day] || day;
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  registerEnrollment() {
    if (!this.canRegister() || this.isRegistering) return;

    // Validar que todos los enrollmentDetailIds existen en data.availableSections
    const validIds = new Set((this.data?.availableSections || []).map(e => e.enrollmentDetailId));
    const filteredEnrolledDetails = this.enrolledDetails.filter(e => validIds.has(e.enrollmentDetailId));
    if (filteredEnrolledDetails.length !== this.enrolledDetails.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de integridad',
        detail: 'Se detectaron cursos inválidos en tu selección. Por favor, revisa tu matrícula.',
        life: 5000
      });
      // Limpiar los que no son válidos
      this.enrolledDetails = filteredEnrolledDetails;
      this.saveEnrolledToStorage();
      return;
    }

    this.isRegistering = true;
    this.isLoading = true;

    const request: EnrollmentRequest = {
      enrollmentDetailIds: this.enrolledDetails.map(e => e.enrollmentDetailId)
    };

    this.studentService.submitEnrollment(request).subscribe({
      next: (response) => {        
        // Actualizar el estado y limpiar datos guardados
        if (this.data) {
          this.data.enrollmentStatus = response.status as EnrollmentStatus;
          this.handleEnrollmentStatus(this.data);
        }
        
        // Limpiar localStorage
        this.studentService.clearEnrollmentData();
        this.enrolledDetails = [];
        
        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Matrícula Registrada',
          detail: `Tu matrícula ha sido registrada correctamente.`,
          life: 5000
        });
        
        // Recargar los datos para mostrar el nuevo estado
        this.loadData();
      },
      error: (error) => {
        console.error('Error al registrar la matrícula:', error);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error al registrar matrícula',
          detail: error.error?.message || 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.',
          life: 5000
        });
        
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        this.isRegistering = false;
      }
    });
  }

  getDialogStyle() {
    if (window.innerWidth < 768) {
      return { width: '100%', 'max-width': '95vw', 'max-height': '90vh' };
    } else {
      return { width: '50vw', 'max-width': '600px', 'max-height': '90vh' };
    }
  }
}