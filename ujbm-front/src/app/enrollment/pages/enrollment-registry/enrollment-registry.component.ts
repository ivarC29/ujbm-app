import { Component, ViewChild } from '@angular/core';
import { PageTitleComponent } from "../../../shared/components/page-title/page-title.component";
import { CourseListComponent } from "../../components/course-list/course-list.component";
import { EnrollmentTableComponent } from "../../components/enrollment-table/enrollment-table.component";
import { Course } from '../../interfaces/course.interface';
import { EnrolledCourse } from '../../interfaces/enrolled-course.interface';
import { EnrollmentService } from '../../service/enrollment.service';
import { CourseSchedule } from '../../interfaces/course-schedule.interface';
import { ToastMessageComponent } from '@shared/components/toast-message/toast-message.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enrollment-registry',
  imports: [PageTitleComponent, CourseListComponent, EnrollmentTableComponent, ToastMessageComponent,CommonModule,ButtonModule],
  templateUrl: './enrollment-registry.component.html',
  styleUrl: './enrollment-registry.component.scss'
})
export default class EnrollmentRegistryComponent {

  enrolledCourses: Course[] = []; // Cursos inscritos
  registeredCourses: EnrolledCourse[] = [];

  // variables para el mensaje de éxito o error
  @ViewChild(ToastMessageComponent) toast!: ToastMessageComponent;

  constructor(private enrollmentService: EnrollmentService,private router: Router) {}

  ngOnInit(): void {
    this.loadEnrolledCourses();
  }

  loadEnrolledCourses(): void {
    this.registeredCourses = this.enrollmentService.getSelectedCourses();
  }

//metodos que se ejecutan al inscribir o eliminar un curso que el componente hijo emite el courselist
  onCourseSelected(schedule: CourseSchedule): void {
    this.loadEnrolledCourses(); // Actualizar la tabla después de inscribir
  }
  onCourseRemoved(courseId: string): void {
    this.enrollmentService.removeCourse(courseId);
    this.loadEnrolledCourses();
  }

  //al confirmar la matrícula, envia a la página de cursos
  confirmEnrollment(): void {
    if (this.registeredCourses.length >= 5) {
      this.toast.showSuccess('¡Matrícula confirmada!', 'Tu matrícula ha sido registrada correctamente.');
      setTimeout(() => {
        this.router.navigate(['/courses']);
      }, 2000);
    } else {
      this.toast.showError('Error', 'Debes inscribir al menos 5 cursos para confirmar la matrícula.');
    }
  }



}
