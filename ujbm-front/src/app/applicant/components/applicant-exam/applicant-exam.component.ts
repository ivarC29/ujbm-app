import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ApplicantService } from '../../services/applicant.service';
import { ExamAccessResponse, ExamState, ExamSubmissionResponse, ExamSubmissionRequest, AnswerSubmission } from '../../interfaces/exam.interfaces';
import { QuestionResponse, AnswerResponse } from '../../interfaces/admission&interview.interfaces';

@Component({
  selector: 'app-applicant-exam',
  standalone: true,  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    MessagesModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    ImageModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './applicant-exam.component.html',
  styleUrls: ['./applicant-exam.component.scss']
})
export class ApplicantExamComponent implements OnInit, OnDestroy {
    examState = signal<ExamState>({
    currentStep: 'dni-validation',
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 3600, 
    isSubmitting: false
  });
  submissionResult?: ExamSubmissionResponse;

  dni = '';
  loading = false;
  
  examQuestions: QuestionResponse[] = [];
  examData?: ExamAccessResponse;
  examStartTime?: Date;  examEndTime?: Date;
  
  private timerInterval?: number;

  constructor(
    private applicantService: ApplicantService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  validateDNI(): void {
    const doc = this.dni?.trim();
    const isNumeric = /^\d{8,12}$/.test(doc);

    if (!doc || !isNumeric) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento inválido',
        detail: 'Por favor ingrese un documento válido (8 a 12 dígitos numéricos)'
      });
      return;
    }    this.loading = true;
    this.applicantService.validateExamAccess(doc).subscribe({
      next: (response: ExamAccessResponse) => {
        if (response.canAccessExam) {          
          if (!response.exam) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Examen no publicado',
              detail: `Estimado/a ${response.fullName}, usted está habilitado para rendir el examen de admisión para el programa de ${response.programName}, pero el examen aún no ha sido publicado. Por favor, contacte al administrador académico.`
            });
            this.loading = false;
            return;
          }

          if (!response.exam.questions || response.exam.questions.length === 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Examen sin preguntas',
              detail: 'El examen no tiene preguntas configuradas. Contacte al administrador.'
            });
            this.loading = false;
            return;
          }

          if (!response.exam.schedule) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Examen sin horario',
              detail: 'El examen no tiene un horario configurado. Contacte al administrador.'
            });
            this.loading = false;
            return;
          }

          const now = new Date();
          const startDateTime = new Date(response.exam.schedule.startDateTime);
          const endDateTime = new Date(response.exam.schedule.endDateTime);
          
          if (now < startDateTime) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Examen no disponible',
              detail: `El examen estará disponible a partir del ${startDateTime.toLocaleString('es-PE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}`
            });
            this.loading = false;
            return;
          }
          
          if (now > endDateTime) {
            this.messageService.add({
              severity: 'error',
              summary: 'Examen cerrado',
              detail: `El examen se cerró el ${endDateTime.toLocaleString('es-PE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}`
            });
            this.loading = false;
            return;
          }

          const examDurationMs = response.exam.durationMinutes * 60 * 1000;
          const timeUntilEndMs = endDateTime.getTime() - now.getTime();
          const actualTimeRemaining = Math.min(examDurationMs, timeUntilEndMs);
          
          this.examData = response;
          this.examQuestions = response.exam.questions || [];
          this.examStartTime = startDateTime;
          this.examEndTime = endDateTime;
            this.examState.update(state => ({
            ...state,
            currentStep: 'exam-taking',
            applicantData: response,
            answers: {},
            timeRemaining: Math.floor(actualTimeRemaining / 1000)
          }));
          
          this.startTimer();
          this.messageService.add({
            severity: 'success',
            summary: 'Acceso autorizado',
            detail: response.message || 'Acceso autorizado al examen'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Acceso denegado',
            detail: response.message || 'No tiene acceso al examen'
          });
        }
        this.loading = false;
      },      error: (error) => {
        console.error('Error validating exam access:', error);
        
        let errorMessage = 'Error al validar el acceso al examen';
        let errorSummary = 'Error';
        
        if (error.status === 404) {
          errorSummary = 'Postulante no encontrado';
          errorMessage = error.error?.message || error.message || `No se encontró un postulante registrado con el documento ${doc}. Verifique que el número esté correcto y que se haya completado el proceso de inscripción.`;
        } else if (error.status === 400) {
          errorSummary = 'Documento inválido';
          errorMessage = error.error?.message || error.message || 'El documento ingresado no es válido.';
        } else if (error.status === 403) {
          errorSummary = 'Acceso restringido';
          errorMessage = error.error?.message || error.message || 'No tiene permisos para acceder al examen.';
        } else if (error.status === 500) {
          errorSummary = 'Error del servidor';
          errorMessage = 'Error interno del servidor. Por favor, intente nuevamente más tarde.';
        } else if (error.error?.message || error.message) {
          errorMessage = error.error?.message || error.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: errorSummary,
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }
  startTimer(): void {
    this.timerInterval = window.setInterval(() => {
      this.examState.update(state => {
        const newTimeRemaining = state.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          // subir cuando el tiempo se acabe
          setTimeout(() => this.submitExam(), 100);
          return { ...state, timeRemaining: 0 };
        }
        return { ...state, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  }selectAnswer(questionIndex: number, answerId: number): void {
    const question = this.examQuestions[questionIndex];
    if (!question) return;

    this.examState.update(state => {
      const newAnswers = { ...state.answers };
      const questionId = question.id;
      
      const isMultipleChoice = question.questionType === 'MULTIPLE_CHOICE';
      
      if (isMultipleChoice) {
        newAnswers[questionId] = [answerId];
      } else {
        const currentAnswers = newAnswers[questionId] || [];
        const answerIndex = currentAnswers.indexOf(answerId);
        
        if (answerIndex > -1) {
          newAnswers[questionId] = currentAnswers.filter(id => id !== answerId);
        } else {
          newAnswers[questionId] = [...currentAnswers, answerId];
        }
      }
      
      return { ...state, answers: newAnswers };
    });
  }

  previousQuestion(): void {
    this.examState.update(state => ({
      ...state,
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
    }));
  }

  nextQuestion(): void {
    this.examState.update(state => ({
      ...state,
      currentQuestionIndex: Math.min(this.examQuestions.length - 1, state.currentQuestionIndex + 1)
    }));
  }

  goToQuestion(index: number): void {
    this.examState.update(state => ({
      ...state,
      currentQuestionIndex: index
    }));
  }  submitExam(): void {
    const state = this.examState();
    
    const answeredQuestionIds = Object.keys(state.answers).map(id => parseInt(id));
    const allQuestionIds = this.examQuestions.map(q => q.id);
    const unansweredQuestions = allQuestionIds.filter(id => !answeredQuestionIds.includes(id)).length;
    
    if (unansweredQuestions > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Examen incompleto',
        detail: `Faltan ${unansweredQuestions} preguntas por responder. El examen se enviará de todas formas.`
      });
    }

    this.examState.update(s => ({ ...s, isSubmitting: true }));

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const answers: AnswerSubmission[] = Object.entries(state.answers).map(([questionId, selectedAnswerIds]) => ({
      questionId: parseInt(questionId),
      selectedAnswerIds: selectedAnswerIds
    }));

    const submissionRequest: ExamSubmissionRequest = {
      answers
    };

    this.applicantService.submitExam(this.dni, submissionRequest).subscribe({
      next: (response: ExamSubmissionResponse) => {
        this.submissionResult = response;
        this.examState.update(s => ({
          ...s,
          currentStep: 'exam-completed',
          isSubmitting: false
        }));
        this.messageService.add({
          severity: 'success',
          summary: 'Examen enviado',
          detail: response.message
        });
      },
      error: (error) => {
        this.examState.update(s => ({ ...s, isSubmitting: false }));
        this.messageService.add({
          severity: 'error',
          summary: 'Error al enviar examen',
          detail: error.error?.message || 'Error al enviar las respuestas del examen'
        });
      }
    });
  }  resetExam(): void {
    this.examState.set({
      currentStep: 'dni-validation',
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 3600,
      isSubmitting: false
    });
    this.dni = '';
    this.examQuestions = [];
    this.examData = undefined;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // methods util
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }  getProgressPercentage(): number {
    const state = this.examState();
    const answeredQuestions = Object.keys(state.answers).length;
    return (answeredQuestions / this.examQuestions.length) * 100;
  }

  getCurrentQuestion(): QuestionResponse | null {
    const state = this.examState();
    return this.examQuestions[state.currentQuestionIndex] || null;
  }
  isQuestionAnswered(index: number): boolean {
    const question = this.examQuestions[index];
    if (!question) return false;
    const answers = this.examState().answers[question.id];
    return answers && answers.length > 0;
  }

  getSelectedAnswer(questionIndex: number): number[] | null {
    const question = this.examQuestions[questionIndex];
    if (!question) return null;
    return this.examState().answers[question.id] || null;
  }

  getTimerClass(): string {
    const timeRemaining = this.examState().timeRemaining;
    if (timeRemaining <= 300) { 
      return 'timer-critical';
    } else if (timeRemaining <= 600) { 
      return 'timer-warning';
    }
    return 'timer-normal';
  }

  get formattedDate(): string {
    return new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get formattedTime(): string {
    return new Date().toLocaleTimeString('es-PE');
  }

  getExamName(): string {
    return this.examData?.exam?.name || 'Examen de Admisión';
  }

  getExamDescription(): string {
    return this.examData?.exam?.description || '';
  }

  getExamDuration(): number {
    return this.examData?.exam?.durationMinutes || 180;
  }

  getTotalQuestions(): number {
    return this.examQuestions.length;
  }

  getQuestionImageUrl(question: QuestionResponse): string | null {
    if (question.questionFile && question.questionFile.data) {
      return `data:${question.questionFile.fileType};base64,${question.questionFile.data}`;
    }
    return null;
  }

  getAnswerImageUrl(answer: AnswerResponse): string | null {
    if (answer.answerFile && answer.answerFile.data) {
      return `data:${answer.answerFile.fileType};base64,${answer.answerFile.data}`;
    }
    return null;
  }

  getAnswerLetter(index: number): string {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return letters[index] || '';
  }
  isAnswerSelected(questionIndex: number, answerId: number): boolean {
    const selectedAnswers = this.getSelectedAnswer(questionIndex);
    return selectedAnswers ? selectedAnswers.includes(answerId) : false;
  }

  getApplicantInfo(): string {
    const applicant = this.examData;
    return applicant ? `${applicant.fullName} - ${applicant.code}` : '';
  }

  getProgramName(): string {
    return this.examData?.programName || '';
  }
}