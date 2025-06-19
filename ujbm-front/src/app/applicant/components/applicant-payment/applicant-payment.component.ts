import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ApplicantResumeResponse } from '../../interfaces/applicant.interfaces';
import { ApplicantService } from '../../services/applicant.service';
import { HttpEventType } from '@angular/common/http';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-applicant-payment-receipt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    MessagesModule,
    ProgressSpinnerModule,
    SelectModule
],
  providers: [MessageService],
  templateUrl: './applicant-payment.component.html',
  styleUrls: ['./applicant-payment.component.scss']
})
   
export class ApplicantReceiptComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  applicantId: string = '';
  selectedPaymentType: string = '';
  applicantData: ApplicantResumeResponse | null = null;
  selectedFile: File | null = null;
  previewUrl: any = null;
  isImage: boolean = false;
  fileIcon: string = 'pi-file';
  isDragover: boolean = false;
  loading: boolean = false;
  uploading: boolean = false;

   paymentTypes = [
    { label: 'Pago de Examen de Admisión', value: 'PAYMENT1', icon: 'pi pi-pencil' },
    { label: 'Pago de Matrícula', value: 'PAYMENT2', icon: 'pi pi-graduation-cap' }
  ];

  constructor(
    private applicantService: ApplicantService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}


  ngOnInit(): void {}

  searchApplicant(): void {
    if (!this.applicantId || !this.selectedPaymentType) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Debe ingresar el documento y seleccionar el tipo de pago'
      });
      return;
    }

    this.loading = true;
    this.applicantData = null;

    this.applicantService.getApplicantResumeByDni(this.applicantId, this.selectedPaymentType).subscribe({
      next: (data) => {
        this.applicantData = data;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró al postulante con el documento proporcionado para este tipo de pago'
        });
        this.loading = false;
      }
    });
  }



  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(): void {
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  processFile(file: File): void {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de formato',
        detail: 'Solo se permiten archivos PDF, JPG o PNG'
      });
      return;
    }

    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de tamaño',
        detail: 'El archivo no debe exceder los 5MB'
      });
      return;
    }

    this.selectedFile = file;
    this.setFileIcon(file.type);
    this.createFilePreview(file);
  }

  setFileIcon(type: string): void {
    if (type.includes('pdf')) {
      this.fileIcon = 'pi-file-pdf';
      this.isImage = false;
    } else if (type.includes('image')) {
      this.fileIcon = 'pi-image';
      this.isImage = true;
    } else {
      this.fileIcon = 'pi-file';
      this.isImage = false;
    }
  }
  createFilePreview(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(result);
    };
    
    reader.readAsDataURL(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getSelectedPaymentTypeLabel(): string {
    const selectedType = this.paymentTypes.find(type => type.value === this.selectedPaymentType);
    return selectedType ? selectedType.label : '';
  }

  getSelectedPaymentTypeIcon(): string {
    const selectedType = this.paymentTypes.find(type => type.value === this.selectedPaymentType);
    return selectedType ? selectedType.icon : 'pi pi-circle';
  }


  uploadReceipt(): void {
  if (!this.selectedFile || !this.applicantData || !this.selectedPaymentType) return;

  this.uploading = true;

  this.applicantService.uploadPaymentReceipt(
    this.applicantData.documentNumber, 
    this.selectedFile,
    this.selectedPaymentType
  ).subscribe({
    next: (event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * event.loaded / (event.total || 1));
      } else if (event.type === HttpEventType.Response || 
                event.body || 
                (typeof event === 'string' && event.includes('exitosa'))) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${this.getSelectedPaymentTypeLabel()} registrado exitosamente`
        });
        
        this.resetForm();
        setTimeout(() => {
          window.location.href = 'https://bausate.edu.pe/';
        }, 3000);
      }
    },
    error: (err) => {
      console.error('Error al subir:', err);
      
      let errorMessage = 'No se pudo subir el comprobante de pago. Por favor intente nuevamente.';
      
      // mensaje del backend
      const backendMsg = err?.error?.message || err?.message || '';
      const lowerMsg = backendMsg.toLowerCase();
      
      // Manejar errores específicos
      if (lowerMsg.includes('maximum upload size exceeded') || lowerMsg.includes('upload size')) {
        errorMessage = 'El archivo es demasiado grande. El tamaño máximo permitido es 5MB. Por favor, seleccione un archivo más pequeño.';
      } else if (lowerMsg.includes('invalid file type') || lowerMsg.includes('file type')) {
        errorMessage = 'Formato de archivo no válido. Solo se permiten archivos PDF, JPG o PNG.';
      } else if (lowerMsg.includes('file not found') || lowerMsg.includes('no file')) {
        errorMessage = 'No se ha seleccionado ningún archivo. Por favor, seleccione un comprobante de pago.';
      } else if (lowerMsg.includes('applicant not found') || lowerMsg.includes('postulante no encontrado')) {
        errorMessage = 'No se encontró al postulante. Verifique el número de documento ingresado.';
      } else if (lowerMsg.includes('payment already exists') || lowerMsg.includes('ya existe')) {
        errorMessage = 'Ya existe un comprobante de pago registrado para este tipo. No es posible subir otro archivo.';
      } else if (backendMsg) {
        errorMessage = backendMsg;
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error al subir archivo',
        detail: errorMessage
      });
      
      this.uploading = false;
    },
    complete: () => {
      if (this.uploading) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `${this.getSelectedPaymentTypeLabel()} registrado exitosamente`
        });
        
        this.resetForm();
        setTimeout(() => {
          window.location.href = 'https://bausate.edu.pe/';
        }, 3000);
      }
    }
  });
}

  resetForm(): void {
  this.selectedFile = null;
  this.previewUrl = null;
  this.fileIcon = 'pi-file';
  this.isImage = false;
  
  this.applicantData = null;
  this.applicantId = '';
  this.selectedPaymentType = '';
  
  this.uploading = false;
  this.isDragover = false;
  
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
}
}
