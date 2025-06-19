import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, CommonModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [header]="header" 
      [modal]="true" 
      [closable]="true" 
      [style]="{ width: '50vw' }"
      [draggable]="false"
      [resizable]="false"
      [contentStyle]="{'max-height': 'calc(80vh - 100px)', 'overflow-y': 'auto'}"
      (onHide)="onClose.emit()"
      styleClass="university-dialog"
    >
      <div class="p-4">
        <ng-content></ng-content>
      </div>
      <ng-template pTemplate="footer">
      <div class="flex justify-end w-full">
          <button
            pButton
            label="Cerrar"
            icon="pi pi-times"
            class="p-button-text"
            (click)="onClose.emit()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    ::ng-deep .university-dialog .p-dialog-header {
      padding: 1rem;
      background-color: var(--primary-color);
      color: white;
    }
    
    ::ng-deep .university-dialog .p-dialog-header .p-dialog-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    ::ng-deep .university-dialog .p-dialog-header .p-dialog-header-icon {
      color: white;
    }

    ::ng-deep .university-dialog .p-dialog-content {
      padding: 0;
    }
    
    @media (max-width: 640px) {
      ::ng-deep .university-dialog .p-dialog-header {
        padding: 0.75rem;
      }
      
      ::ng-deep .university-dialog .p-dialog-header .p-dialog-title {
        font-size: 1rem;
      }
    }
  `]
})
export class DialogComponent {
  @Input() visible: boolean = false;
  @Input() header: string = '';
  @Input() width?: string;
  @Output() onClose = new EventEmitter<void>();
  public dialogStyle: any = {};
  
  constructor() {
    this.updateDialogStyle();
  }
  
  @HostListener('window:resize')
  onResize() {
    this.updateDialogStyle();
  }
  
  private updateDialogStyle() {
    
    const width = window.innerWidth;
    
    if (this.width) {
      this.dialogStyle = { width: this.width };
    } else if (width < 640) {
      this.dialogStyle = { width: '95vw', maxWidth: '95vw' };
    } else if (width < 1024) {
      this.dialogStyle = { width: '80vw', maxWidth: '600px' };
    } else {
      this.dialogStyle = { width: '50vw', maxWidth: '800px' };
    }
  }
}