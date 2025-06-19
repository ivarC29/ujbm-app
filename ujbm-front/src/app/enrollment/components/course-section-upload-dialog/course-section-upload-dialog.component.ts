import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

import { CourseSectionService } from '../../service/course-section.service';
import { CourseSectionBatchUploadResponse } from '../../interfaces/course-section.interface';

@Component({
  selector: 'app-course-section-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    FileUploadModule,
    ProgressBarModule
  ],
  templateUrl: './course-section-upload-dialog.component.html',
  styleUrls: ['./course-section-upload-dialog.component.scss']
})
export class CourseSectionUploadDialogComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() uploaded = new EventEmitter<CourseSectionBatchUploadResponse>();

   selectedFile: File | null = null;
  loading: boolean = false;
  uploadProgress: number = 0;
  
  private validFileExtensions = ['.xlsx', '.xls','.csv'];

  constructor(
    private courseSectionService: CourseSectionService,
    private messageService: MessageService
  ) {}

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.reset();
  }

  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      if (this.isValidExcelFile(file)) {
        this.selectedFile = file;
      } else {
        this.showInvalidFileError();
      }
    }
  }

  onFileDrop(event: any) {
    if (event.files && event.files.length) {
      const file = event.files[0];
      if (this.isValidExcelFile(file)) {
        this.selectedFile = file; 
      } else {
        this.showInvalidFileError();
      }
    }
  }

  private isValidExcelFile(file: File): boolean {
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    return this.validFileExtensions.includes(fileExt);
  }
  
  private showInvalidFileError() {
    this.messageService.add({
      severity: 'error', 
      summary: 'Error',
      detail: 'Solo se permiten archivos Excel'
    });
    this.reset();
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar un archivo'
      });
      return;
    }

    this.loading = true;
    this.uploadProgress = 0;
    
  
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.courseSectionService.batchUpload(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        
        setTimeout(() => {
          this.loading = false;
          
          if (response.errorCount > 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Carga completada con advertencias',
              detail: `Se procesaron ${response.totalRecords} registros. ${response.successCount} exitosos y ${response.errorCount} con errores.`,
              life: 5000
            });
          } else {
            this.messageService.add({
              severity: 'success',
              summary: 'Carga exitosa',
              detail: `Se procesaron ${response.totalRecords} registros exitosamente.`,
              life: 3000
            });
          }
          
          this.uploaded.emit(response);
          this.hideDialog();
        }, 500);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al subir el archivo'
        });
      }
    });
  }

  reset() {
    this.selectedFile = null;
    this.uploadProgress = 0;
  }
}