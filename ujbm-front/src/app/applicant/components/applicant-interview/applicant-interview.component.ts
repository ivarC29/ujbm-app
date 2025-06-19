import { Component, OnInit, signal } from '@angular/core';
import { ApplicantService } from '../../services/applicant.service';
import { PendingInterviewApplicantResponse } from '../../interfaces/exam.interfaces';
import { ApplicantScoreResponse } from '../../interfaces/applicant.interfaces';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-applicant-interview',
  imports: [CommonModule,FormsModule,ToastModule],
  templateUrl: './applicant-interview.component.html',
  styleUrls: ['./applicant-interview.component.scss'],
  providers: [MessageService]
})
export class ApplicantInterviewComponent implements OnInit {
  loading = false;
  pendingInterviews = signal<PendingInterviewApplicantResponse[]>([]);
  expandedIndex = signal<number | null>(null);
  confirmIndex = signal<number | null>(null);
  scoreInputs = signal<{ [dni: string]: number }>({});
  submitting = signal<{ [dni: string]: boolean }>({});
  submittedScore = signal<{ [dni: string]: ApplicantScoreResponse | null }>({});

  constructor(
    private applicantService: ApplicantService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchInterviews();
  }

  fetchInterviews(): void {
    this.loading = true;
    this.applicantService.getPendingJournalismInterviews().subscribe({
      next: (list) => {
        // Ordenar por registryDate (hoy), luego por id
        const today = new Date().toISOString().slice(0, 10);
        const filtered = list
          .filter(i => i.registryDate === today)
          .sort((a, b) => a.id - b.id);
        this.pendingInterviews.set(filtered);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las entrevistas pendientes'
        });
        this.loading = false;
      }
    });
  }

  getMeetingTime(index: number): string {
    // Empieza a las 11:00, cada cita suma 1 hora
    const base = new Date();
    base.setHours(11 + index, 0, 0, 0);
    return base.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  getMeetingLink(applicant: PendingInterviewApplicantResponse): string {
    //link del meet, podria hacer una reunion recurrente y enviar asi el mismo liink solo q distinta hora
    return `https://utpvirtual.zoom.us/j/83040484866`;
  }

  toggleAccordion(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
    this.confirmIndex.set(null);
  }

  confirmFinish(index: number): void {
    this.confirmIndex.set(index);
  }

  submitScore(applicant: PendingInterviewApplicantResponse): void {
    const score = this.scoreInputs()[applicant.documentNumber];
    if (score == null || isNaN(score) || score < 0 || score > 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nota inválida',
        detail: 'Ingrese una nota entre 0 y 100'
      });
      return;
    }
    this.submitting.update(s => ({ ...s, [applicant.documentNumber]: true }));
    this.applicantService.setInterviewScore(applicant.documentNumber, { score }).subscribe({
      next: (resp) => {
        this.submittedScore.update(s => ({ ...s, [applicant.documentNumber]: resp }));
        this.messageService.add({
          severity: 'success',
          summary: 'Nota registrada',
          detail: `Nota registrada correctamente para ${applicant.fullName}`
        });
        this.confirmIndex.set(null);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo registrar la nota'
        });
      },
      complete: () => {
        this.submitting.update(s => ({ ...s, [applicant.documentNumber]: false }));
      }
    });
  }
}
