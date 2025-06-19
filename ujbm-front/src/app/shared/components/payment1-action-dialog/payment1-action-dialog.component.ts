import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ApplicantService } from '../../../applicant/services/applicant.service';

@Component({
  selector: 'app-payment1-action-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="payment-action-dialog p-4">
    <div class="text-center mb-4">
         <i class="pi pi-credit-card text-4xl text-blue-500 mb-3"></i>
      <h4 class="text-lg font-semibold mb-2">Gestionar Pago de Admisión</h4>
      <p class="text-gray-600 text-sm">
        @if (isAlreadyExonerated()) {
          <span class="text-green-600 font-medium">Este postulante tiene el pago exonerado.</span>
        } @else {
          Seleccione una acción para el pago de admisión de este postulante.
        }
      </p>
    </div>

      @if (!isAlreadyExonerated()) {
      <div class="flex flex-col gap-3">
        <button
          pButton
          label="Exonerar pago"
          icon="pi pi-check"
          class="p-button-success w-full"
          [disabled]="processing"
          [loading]="processing && currentAction === 'exonerate'"
          (click)="exoneratePayment()"
        ></button>
        
        <button
          pButton
          label="Generar cobro"
          icon="pi pi-credit-card"
          class="p-button-info w-full"
          [disabled]="processing"
          [loading]="processing && currentAction === 'generate'"
          (click)="generateCollection()"
        ></button>
        
        <button
          pButton
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-outlined w-full"
          [disabled]="processing"
          (click)="cancel()"
        ></button>
      </div>
    } @else {
      <div class="flex justify-center">
        <button
          pButton
          label="Cerrar"
          icon="pi pi-times"
          class="p-button-outlined"
          (click)="cancel()"
        ></button>
      </div>
    }
  </div>
  `,
  styles: [`
    .payment-action-dialog {
      min-width: 300px;
      max-width: 400px;
    }
  `]
})
export class Payment1ActionDialogComponent {
  protected config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private messageService = inject(MessageService);
  private applicantService = inject(ApplicantService);

  processing = false;
  currentAction: 'exonerate' | 'generate' | null = null;

  ngOnInit(): void {
    // Si ya está exonerado, cerrar el modal inmediatamente
    if (this.isAlreadyExonerated()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'Este postulante ya tiene el pago exonerado.'
      });
      this.ref.close();
    }
  }

  isAlreadyExonerated(): boolean {
    return this.config.data?.hasPaidAdmissionFee === true;
  }

  exoneratePayment(): void {
    if (this.processing) return;
    
    this.processing = true;
    this.currentAction = 'exonerate';
    
    const applicantId = this.config.data?.applicantId;
    
    this.applicantService.exonerateAdmissionPayment(applicantId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago exonerado correctamente'
        });
        this.ref.close('updated');
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al exonerar el pago'
        });
        this.processing = false;
        this.currentAction = null;
      }
    });
  }

  generateCollection(): void {
    if (this.processing) return;
    
    this.processing = true;
    this.currentAction = 'generate';
    
    const applicantId = this.config.data?.applicantId;
    
    this.applicantService.generateCollection(applicantId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cobro generado correctamente'
        });
        this.ref.close('updated');
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al generar el cobro'
        });
        this.processing = false;
        this.currentAction = null;
      }
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
