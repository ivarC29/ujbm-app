import { Component, OnInit } from '@angular/core';
import { TeacherCourseSectionResponse } from '../../interfaces/teacher.interfaces';
import { MessageService } from 'primeng/api';
import { TeacherService } from '../../services/teacher-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService,DynamicDialogRef } from 'primeng/dynamicdialog';
import { SectionDetailsDialogComponent } from '@shared/components/section-details-dialog/section-details-dialog.component';


@Component({
  selector: 'app-teacher-course-sections',
  imports: [CommonModule,
    ButtonModule,
    CardModule,
    ChipModule,
    ToastModule,
    ProgressSpinnerModule],
  templateUrl: './teacher-course-sections.component.html',
  styleUrl: './teacher-course-sections.component.scss',
  providers: [MessageService,DialogService]
})
export class TeacherCourseSectionsComponent implements OnInit {
  courseSections: TeacherCourseSectionResponse[] = [];
  loading = true;

  private dayMapping: { [key: string]: string } = {
    'MONDAY': 'LUN',
    'TUESDAY': 'MAR', 
    'WEDNESDAY': 'MIÉ',
    'THURSDAY': 'JUE',
    'FRIDAY': 'VIE',
    'SATURDAY': 'SÁB',
    'SUNDAY': 'DOM'
  };

  constructor(
    private teacherService:  TeacherService,
    private messageService: MessageService,
    private dialogService: DialogService,
  ) {}

  private dialogRef: DynamicDialogRef | undefined;

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.loading = true;
    this.teacherService.getMyCourses().subscribe({
      next: (sections) => {
        this.courseSections = sections;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las secciones de curso'
        });
        this.loading = false;
      }
    });
  }

  getTotalCredits(): number {
    return this.courseSections.reduce((total, section) => total + section.course.credits, 0);
  }

  getDayAbbreviation(day: string): string {
    return this.dayMapping[day] || day;
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // "10:30:00" -> "10:30"
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const duration = end - start;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  viewSectionDetails(section: TeacherCourseSectionResponse): void {
  this.dialogRef = this.dialogService.open(SectionDetailsDialogComponent, {
    header: `Detalles de ${section.course.code} - Sección ${section.section}`,
    width: '800px',
    contentStyle: { 'max-height': '90vh', overflow: 'auto' },
    baseZIndex: 10000,
    data: {
      section: section
    }
  });

  this.dialogRef.onClose.subscribe((result) => {
    if (result) {
      // Manejar resultado si es necesario
    }
  });
}

}
