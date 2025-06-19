import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-file-upload-dialog',
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [header]="header" 
      [(visible)]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [style]="{width: '90vw', maxWidth: '500px'}"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [closable]="true"
      styleClass="p-fluid"
    >
  <div class="upload-container">
    <!-- Área de arrastrar y soltar -->
    <div 
      class="file-upload-area" 
      [class.dragover]="isDragging"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <div class="flex flex-column align-items-center justify-content-center">
        <i class="pi pi-file-excel text-5xl mb-3" [class.text-primary]="!selectedFile" [class.text-success]="selectedFile"></i>
        
        @if (selectedFile) {
          <span class="font-bold mb-2">{{ selectedFile.name }}</span>
        } @else {
          <span class="font-bold mb-2">Arrastra y suelta el archivo aquí</span>
          <span class="text-sm text-500 mb-3">O haz clic para seleccionar</span>
        }
        
        <input 
          type="file"
          #fileInput
          [accept]="acceptedFormats"
          (change)="onFileSelected($event)"
          style="display: none"
        />
        
        @if (!selectedFile) {
          <button 
            pButton 
            type="button" 
            label="Seleccionar Archivo" 
            icon="pi pi-upload" 
            class="p-button-outlined"
            (click)="fileInput.click()"
          ></button>
        }
        
        <!-- Mostrar nombre y tamaño del archivo si está seleccionado -->
        @if (selectedFile) {
          <div class="mt-3 w-full">
            <div class="flex align-items-center justify-content-between border-1 surface-border border-round p-3 bg-gray-50 dark:bg-gray-900">
              <div class="flex align-items-center">
                <i class="pi pi-file-o mr-2"></i>
                <span>{{ selectedFile.name }}</span>
              </div>
              <button 
                pButton 
                type="button" 
                icon="pi pi-times" 
                class="p-button-rounded p-button-text p-button-danger"
                (click)="removeSelectedFile()"
              ></button>
            </div>
            <small class="text-500">{{ formatFileSize(selectedFile.size) }}</small>
          </div>
        }
      </div>
    </div>
    
    <!-- Mensaje informativo -->
    <div class="mt-3 p-3 border-round bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
      <i class="pi pi-info-circle mr-2"></i>
      <span>{{ infoMessage }}</span>
    </div>
  </div>
  
  <ng-template pTemplate="footer">
    <button 
      pButton 
      type="button" 
      label="Cancelar" 
      icon="pi pi-times" 
      class="p-button-text"
      (click)="hideDialog()"
    ></button>
    <button 
      pButton 
      type="button" 
      label="Subir" 
      icon="pi pi-upload" 
      class="p-button-success" 
      [disabled]="!selectedFile || uploading"
      (click)="uploadFile()"
    ></button>
  </ng-template>
</p-dialog> `,
  styles: [`
     .upload-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .file-upload-area {
      border: 2px dashed var(--surface-border);
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background-color: var(--surface-ground);
      
      &:hover, &.dragover {
        border-color: var(--primary-color);
        background-color: var(--surface-hover);
      }
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .main-text {
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: block;
    }

    .sub-text {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
      display: block;
    }

    .file-name {
      font-weight: 600;
      margin-bottom: 1rem;
      word-break: break-all;
      max-width: 100%;
    }

    .select-btn {
      margin-top: 0.5rem;
    }

    .file-info {
      margin-top: 1rem;
      width: 100%;
    }

    .file-details {
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 0.75rem;
      background-color: var(--surface-50);
    }

    .file-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .file-name-truncated {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
    }

    .remove-btn {
      width: 1.5rem !important;
      height: 1.5rem !important;
      min-width: 1.5rem !important;
      flex-shrink: 0;
    }

    .file-size {
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    .info-message {
      padding: 0.75rem;
      border-radius: 6px;
      background-color: var(--blue-50);
      color: var(--blue-800);
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .info-text {
      font-size: 0.875rem;
      line-height: 1.4;
    }

    /* Estilos responsive mejorados */
    @media screen and (max-width: 768px) {
      :host ::ng-deep .upload-dialog-responsive {
        width: 95vw !important;
        max-width: 95vw !important;
      }
      
      .file-upload-area {
        padding: 1.5rem 1rem;
      }

      .upload-icon {
        font-size: 2.5rem;
        margin-bottom: 0.75rem;
      }

      .main-text {
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }

      .sub-text {
        font-size: 0.8rem;
        margin-bottom: 0.75rem;
      }

      .select-btn {
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
      }

      .info-message {
        padding: 0.6rem;
      }

      .info-text {
        font-size: 0.8rem;
      }
    }

    @media screen and (max-width: 480px) {
      :host ::ng-deep .upload-dialog-responsive {
        width: 98vw !important;
        max-width: 98vw !important;
      }

      :host ::ng-deep .p-dialog-content {
        padding: 0.75rem;
      }
      
      .file-upload-area {
        padding: 1rem 0.5rem;
      }

      .upload-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .main-text {
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
      }

      .sub-text {
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .file-name {
        font-size: 0.8rem;
        margin-bottom: 0.75rem;
      }

      .select-btn {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }

      .file-details {
        padding: 0.5rem;
      }

      .file-name-truncated {
        font-size: 0.8rem;
      }

      .file-size {
        font-size: 0.7rem;
      }

      .info-message {
        padding: 0.5rem;
      }

      .info-text {
        font-size: 0.75rem;
      }

      :host ::ng-deep .p-dialog-footer {
        padding: 0.75rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      :host ::ng-deep .p-dialog-footer button {
        width: 100%;
        margin: 0 !important;
        font-size: 0.875rem;
      }

      .cancel-btn {
        order: 2;
      }

      .upload-btn {
        order: 1;
      }
    }

    @media screen and (max-width: 360px) {
      .file-upload-area {
        padding: 0.75rem 0.25rem;
      }

      .upload-icon {
        font-size: 1.75rem;
      }

      .main-text {
        font-size: 0.8rem;
      }

      .sub-text {
        font-size: 0.7rem;
      }

      .select-btn {
        font-size: 0.75rem;
        padding: 0.35rem 0.7rem;
      }
    }

    /* Dark theme adjustments */
    :host-context(.dark) {
      .info-message {
        background-color: var(--blue-900);
        color: var(--blue-100);
      }

      .file-details {
        background-color: var(--surface-900);
      }
    }
  `]
})
export class FileUploadDialogComponent {
@Input() visible = false;
  @Input() header = 'Subir Archivo';
  @Input() acceptedFormats = '.txt,.csv';
  @Input() infoMessage = 'El archivo debe tener el formato correcto';
  @Input() uploading = false;
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() upload = new EventEmitter<File>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFile: File | null = null;
  isDragging = false;

  // Manejadores para drag and drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (this.validateFile(file)) {
        this.selectFile(file);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.validateFile(file)) {
        this.selectFile(file);
      }
    }
  }

  selectFile(file: File): void {
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.upload.emit(this.selectedFile);
    }
  }

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private validateFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const formats = this.acceptedFormats.split(',');
    
    return formats.some(format => fileName.endsWith(format.replace('*', '').trim()));
  }
}
