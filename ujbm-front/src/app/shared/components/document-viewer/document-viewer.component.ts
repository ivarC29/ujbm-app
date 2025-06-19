import { Component, inject, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { ApplicantService } from 'src/app/applicant/services/applicant.service';
import { SafePipe } from '../../pipes/safe.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface FileData {
  url: string;
  fileType: string;
  fileName: string;
  isPdf: boolean;
}

@Component({
  selector: 'document-viewer',
  imports: [
    ButtonModule,
    ToastModule,
    CommonModule,
    SafePipe,
    ProgressSpinnerModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="document-container">
        @if (documentType === 'PAYMENT1' && !fileData && isPaymentExonerated()) {
      <div class="non-previewable-container">
        <i class="pi pi-check-circle text-green-500 text-4xl mb-3"></i>
        <h4 class="text-green-600 font-semibold mb-2">Pago exonerado</h4>
        <p class="text-gray-700 text-center">Este postulante fue exonerado del pago de admisión. No hay comprobante para mostrar.</p>
      </div>
    } @else if (documentType !== 'syllabus' && fileData) {
        <div class="content-wrapper">
          
          <div class="preview-container" [class.image-container]="isImage">
            @if (sanitizedUrl && isPreviewable && !isMobileView()) {
              @if (isImage) {
                <img 
                  [src]="sanitizedUrl | safe" 
                  class="document-image"
                  alt="Documento"
                  (error)="onImageError()"
                />
              } @else {
                <iframe
                  [src]="sanitizedUrl | safe"
                  frameborder="0"
                  class="document-frame"
                  (error)="onIframeError()"
                ></iframe>
              }
            }
            
            <!-- Vista móvil o error de carga -->
            @if (!isPreviewable || isMobileView() || hasLoadError) {
              <div class="non-previewable-container">
                <i class="pi pi-file text-4xl text-blue-500 mb-3"></i>
                <h4 class="font-medium text-lg mb-2 text-center">
                  @if (isMobileView() && fileData.isPdf) {
                    PDF no disponible en vista móvil
                  } @else if (hasLoadError) {
                    Error al cargar el documento
                  } @else {
                    Documento no previsualizable
                  }
                </h4>
                <p class="text-gray-600 mb-4 text-center text-sm">
                  @if (isMobileView() && fileData.isPdf) {
                    Para una mejor experiencia, descarga el PDF y ábrelo en tu aplicación preferida.
                  } @else {
                    Descarga el documento para verlo en tu aplicación predeterminada.
                  }
                </p>
                <button 
                  pButton 
                  label="Descargar" 
                  icon="pi pi-download" 
                  class="p-button-outlined p-button-sm"
                  (click)="downloadFile()"
                ></button>
              </div>
            }
          </div>
          
          <div class="action-buttons">
            @if (!isValidated) {
              <div class="button-group">
                <button 
                  pButton 
                  label="Validar" 
                  icon="pi pi-check" 
                  class="p-button-success"
                  [disabled]="processing"
                  [loading]="processing"
                  (click)="validateDocument()"
                ></button>
                <button 
                  pButton 
                  label="Rechazar" 
                  icon="pi pi-times" 
                  class="p-button-danger p-button-sm"
                  [disabled]="processing"
                  [loading]="processing"
                  (click)="rejectDocument()"
                ></button>
              </div>
            } @else {
              <div class="validation-status success">
                <i class="pi pi-check-circle text-green-500 "></i> 
                <span class="text-green-500">Documento validado</span>
              </div>
            }
          </div>
        </div>
      }
      
      @if (documentType === 'syllabus') {
        <div class="syllabus-container">
          <i class="pi pi-file-pdf text-5xl text-orange-500 mb-3"></i>
          <h3 class="font-medium text-xl mb-2">Gestión de Sílabos</h3>
          <p class="text-gray-600 mb-4 text-center">Los sílabos deben ser descargados para su visualización.</p>
          
          <button 
            pButton 
            label="Descargar todos los sílabos" 
            icon="pi pi-download" 
            class="p-button-outlined p-button-info mb-4"
            [disabled]="processing"
            [loading]="processing"
            (click)="downloadAllSyllabus()"
          ></button>
          
          <div class="syllabus-actions">
            @if (!isSyllabusRejected()) {
              <div class="button-group">
                <button 
                  pButton 
                  label="Rechazar sílabos" 
                  icon="pi pi-times" 
                  class="p-button-danger"
                  [disabled]="processing"
                  [loading]="processing"
                  (click)="rejectDocument()"
                ></button>
              </div>
              <p class="text-sm text-gray-500 mt-3 text-center">
                Los sílabos se validan automáticamente cuando el postulante es convertido a estudiante.
              </p>
            } @else {
              <div class="validation-status error">
                <i class="pi pi-times-circle"></i> 
                <span>Sílabos rechazados</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .document-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    height: 100%;
  }

  .preview-container {
    position: relative;
    width: 100%;
    background: var(--surface-ground);
    border-radius: 8px;
    overflow: hidden;
    flex: 1;
    min-height: 300px;
  }

  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    padding: 1rem;
  }

  .document-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .document-frame {
    width: 100%;
    height: 100%;
    border: none;
    min-height: 500px;
  }

  .non-previewable-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--surface-100);
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .action-buttons {
    padding: 1rem 0;
    display: flex;
    justify-content: center;
    background: var(--surface-card);
    border-radius: 8px;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .validation-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    
    &.success {
      color: var(--green-600);
      background: var(--green-50);
      border: 1px solid var(--green-200);
    }
    
    &.error {
      color: var(--red-600);
      background: var(--red-50);
      border: 1px solid var(--red-200);
    }
  }

  .syllabus-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: var(--surface-50);
    border-radius: 8px;
    width: 100%;
    min-height: 300px;
  }

  .syllabus-actions {
    margin-top: 2rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* RESPONSIVE STYLES */
  @media screen and (max-width: 768px) {
    .document-container {
      padding: 0.5rem;
    }

    .preview-container {
      min-height: 250px;
    }

    .image-container {
      padding: 0.5rem;
    }

    .document-frame {
      min-height: 400px;
    }

    .non-previewable-container {
      padding: 1.5rem;
      min-height: 250px;
      
      h4 {
        font-size: 1rem !important;
      }
      
      p {
        font-size: 0.875rem !important;
      }
    }

    .button-group {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
      
      .p-button {
        width: 100%;
      }
    }

    .validation-status {
      font-size: 0.875rem;
      text-align: center;
    }
  }

  @media screen and (max-width: 480px) {
    .document-container {
      padding: 0.25rem;
    }

    .non-previewable-container {
      padding: 1rem;
      
      .pi {
        font-size: 2.5rem !important;
      }
      
      h4 {
        font-size: 0.875rem !important;
        margin-bottom: 0.5rem !important;
      }
      
      p {
        font-size: 0.75rem !important;
        margin-bottom: 1rem !important;
      }
    }

    .syllabus-container {
      padding: 1rem;
      
      .pi {
        font-size: 3rem !important;
      }
      
      h3 {
        font-size: 1.125rem !important;
      }
      
      p {
        font-size: 0.875rem !important;
      }
    }
  }
`],
  providers: [MessageService]
})
export class DocumentViewerComponent implements OnInit {
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private messageService = inject(MessageService);
  private applicantService = inject(ApplicantService);
  
  isImage: boolean = false;
  fileData: FileData | null = null;
  documentType: string = '';
  applicantId: number = 0;
  sanitizedUrl: any;
  isValidated: boolean = false;
  isPreviewable: boolean = false;
  processing: boolean = false;
  enrollmentModeCode: string = '';
  hasLoadError: boolean = false;
  isExonerated: boolean = false; // Add exonerated flag

  ngOnInit(): void {
    this.fileData = this.config.data?.fileData;
    this.documentType = this.config.data?.documentType;
    this.applicantId = this.config.data?.applicantId;
    this.isValidated = this.config.data?.isValidated;
    this.enrollmentModeCode = this.config.data?.enrollmentModeCode;
    // Add exonerated flag
    this.isExonerated = this.config.data?.isExonerated || false;
    if (this.fileData) {
      this.sanitizedUrl = this.fileData.url;
      this.checkFilePreviewability();
    }
  }

  // Nuevo método para detectar vista móvil
  isMobileView(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  }

  // Nuevo método para truncar nombres de archivo largos
  getTruncatedFileName(fileName: string): string {
    if (!fileName) return '';
    
    const maxLength = this.isMobileView() ? 25 : 50;
    
    if (fileName.length <= maxLength) {
      return fileName;
    }
    
    // Mantener la extensión
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const name = fileName.substring(0, lastDotIndex);
      const extension = fileName.substring(lastDotIndex);
      const truncatedName = name.substring(0, maxLength - extension.length - 3) + '...';
      return truncatedName + extension;
    }
    
    return fileName.substring(0, maxLength - 3) + '...';
  }

  // Manejo de errores de carga
  onImageError(): void {
    this.hasLoadError = true;
  }

  onIframeError(): void {
    this.hasLoadError = true;
  }

  checkFilePreviewability(): void {
    if (!this.fileData) return;

    // En móviles, no previsualizar PDFs para evitar errores
    if (this.isMobileView() && this.fileData.isPdf) {
      this.isPreviewable = false;
      return;
    }

    // Verificar por tipo MIME
    const previewableMimeTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/svg+xml'
    ];
    
    // Si es una imagen basado en MIME type
    this.isImage = this.fileData.fileType.startsWith('image/');
    
    if (previewableMimeTypes.includes(this.fileData.fileType)) {
      this.isPreviewable = true;
      return;
    }
    
    const fileName = this.fileData.fileName.toLowerCase();
    const previewableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg'];
    
    // Verificar por extensión de archivo
    if (!this.isImage) {
      this.isImage = ['.jpg', '.jpeg', '.png', '.gif', '.svg'].some(ext => fileName.endsWith(ext));
    }
    
    this.isPreviewable = previewableExtensions.some(ext => fileName.endsWith(ext));
  }

  downloadFile(): void {
    if (!this.fileData) return;

    const link = document.createElement('a');
    link.href = this.fileData.url;
    link.download = this.fileData.fileName;
    link.click();
  }

  downloadAllSyllabus(): void {
    if (!this.applicantId) return;
    
    this.processing = true;
    
    this.applicantService.downloadSyllabus(this.applicantId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `syllabus_${this.applicantId}.zip`;
        link.click();
        
        window.URL.revokeObjectURL(url);
        this.processing = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Descarga completada',
          detail: 'Los sílabos se han descargado correctamente'
        });
      },
      error: (error) => {
        console.error('Error downloading syllabus:', error);
        this.processing = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron descargar los sílabos'
        });
      }
    });
  }

  validateDocument(): void {
    if (this.processing) return;

    // Prevenir validación de sílabos
    if (this.documentType === 'syllabus') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Los sílabos no pueden ser validados manualmente. Se validan automáticamente durante la conversión a estudiante.'
      });
      return;
    }
    this.processing = true;
    
    this.applicantService.validateDocument(this.applicantId, this.documentType).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Validación exitosa',
          detail: `El documento ${this.getDocumentTypeName()} ha sido validado correctamente`
        });
        
        this.isValidated = true;
        
        setTimeout(() => {
          this.processing = false;
          this.ref.close('validated');
        }, 2000);
      },
      error: (error) => {
        console.error('Error validating document:', error);
        this.processing = false;

        const errorMessage = error.message || 'No se pudo validar el documento';

        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  rejectDocument(): void {
    if (this.processing) return;
    this.processing = true;
    
    if (this.documentType === 'syllabus') {
      this.rejectSyllabus();
      return;
    }
    
    this.applicantService.rejectDocument(this.applicantId, this.documentType).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Documento rechazado',
          detail: `El documento ${this.getDocumentTypeName()} ha sido rechazado`
        });
        
        setTimeout(() => {
          this.processing = false;
          this.ref.close('rejected');
        }, 2000);
      },
      error: (error) => {
        console.error('Error rejecting document:', error);
        this.processing = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo rechazar el documento'
        });
      }
    });
  }

  rejectSyllabus(): void {
    this.applicantService.rejectSyllabus(this.applicantId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sílabos rechazados',
          detail: 'Los sílabos han sido rechazados'
        });
        
        setTimeout(() => {
          this.processing = false;
          this.ref.close('rejected');
        }, 2000);
      },
      error: (error) => {
        console.error('Error rejecting syllabus:', error);
        this.processing = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron rechazar los sílabos'
        });
      }
    });
  }

  isSyllabusRejected(): boolean {
    return this.config.data?.isRejected || false;
  }

 

  getDocumentTypeName(): string {
  switch (this.documentType) {
    case 'dni': return 'DNI';
    case 'certificate': return 'Certificado de Estudios';
    case 'photo': return 'Fotografía';
    case 'PAYMENT1': return 'Comprobante de Pago (Examen)';  
    case 'PAYMENT2': return 'Comprobante de Cuota 1'; 
    case 'syllabus': return 'Sílabos';
    default: return '';
  }
}

isPaymentExonerated(): boolean {
  return this.config.data?.isExonerated === true;
}
}