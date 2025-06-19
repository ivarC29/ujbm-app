import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApplicantService } from '../../services/applicant.service';
import { ApplicantScorePublicResponse } from '../../interfaces/admission&interview.interfaces';

@Component({
  selector: 'app-admission-score',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './admission-score.component.html',
  styleUrl: './admission-score.component.scss'
})
export class AdmissionScoreComponent {
  private applicantService = inject(ApplicantService);
  private messageService = inject(MessageService);

  // Signals para manejo de estado
  dni = '';
  loading = signal(false);
  showResult = signal(false);
  scoreResult = signal<ApplicantScorePublicResponse | null>(null);

  checkScore(): void {
    if (!this.dni || this.dni.length < 8 || this.dni.length > 12) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese un número de documento válido (8-12 dígitos)',
        life: 3000
      });
      return;
    }

    this.loading.set(true);
    this.showResult.set(false);

    this.applicantService.getApplicantScoreByDni(this.dni).subscribe({
      next: (response) => {
        this.scoreResult.set(response);
        this.showResult.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al consultar resultado:', error);
        let errorMessage = 'Error al consultar el resultado del examen';

        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
        this.loading.set(false);
      }
    });
  }

  resetForm(): void {
    this.dni = '';
    this.showResult.set(false);
    this.scoreResult.set(null);
  }

  isDocumentValid(): boolean {
    return !!this.dni && this.dni.length >= 8 && this.dni.length <= 12;
  }
}
