import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ApplicantService } from '../../services/applicant.service';
import { ExamCreateRequest, ExamDetailResponse, ExamFileType, ExamStatus, ExamUpdateRequest, QuestionType, ScheduleType } from '../../interfaces/admission&interview.interfaces';
import { ProgramResponse } from '@shared/interfaces/program.interfaces';
import { ExcelExamUploadComponent } from '@shared/components/excel-exam-upload/excel-exam-upload.component';

interface Answer {
  id: string;
  answerText: string;
  isCorrect: boolean;
  answerFile: any;
}

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  questionFile: any;
  answers: Answer[];
}

@Component({
  selector: 'app-applicant-exam-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    FileUploadModule,
    ToastModule,
    ExcelExamUploadComponent,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './applicant-exam-management.component.html',
  styleUrl: './applicant-exam-management.component.scss'
})
export class ApplicantExamManagementComponent implements OnInit {
  @Input() forceExcelMode: boolean = false;
  @Input() examId?: number;
  @Input() editMode = false;
  @Output() examCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() switchToManual = new EventEmitter<void>(); 
  @Output() examUpdated = new EventEmitter<void>();

  examForm!: FormGroup;
  questionForm!: FormGroup; 
  programs = signal<ProgramResponse[]>([]);
  loading = signal(false);
  showExcelUpload = signal(false);
  academicPeriods = signal<any[]>([]);

  
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);

  questionTypes = [
    { label: 'Opción múltiple', value: QuestionType.MULTIPLE_CHOICE },
    { label: 'Verdadero/Falso', value: QuestionType.TRUE_FALSE },
    { label: 'Ensayo', value: QuestionType.ESSAY },
    { label: 'Subida de archivo', value: QuestionType.FILE_UPLOAD },
    { label: 'Respuesta corta', value: QuestionType.SHORT_ANSWER }
  ];
  readonly ESSAY = QuestionType.ESSAY;
  readonly FILE_UPLOAD = QuestionType.FILE_UPLOAD;
  readonly SHORT_ANSWER = QuestionType.SHORT_ANSWER;
  readonly MULTIPLE_CHOICE = QuestionType.MULTIPLE_CHOICE;
  readonly TRUE_FALSE = QuestionType.TRUE_FALSE;

  private originalExamData?: ExamDetailResponse;

  constructor(
    private fb: FormBuilder,
    private applicantService: ApplicantService,
    private messageService: MessageService
  ) {
    this.createForms();
    this.initializeFirstQuestion();
  }

  ngOnInit(): void {
    this.loadPrograms();
    this.loadAcademicPeriods();

    if (this.forceExcelMode) {
      this.showExcelUpload.set(true);
    }

    if (this.editMode && this.examId) {
      this.loadExamForEdit();
    }
  }

  createForms(): void {
    this.examForm = this.fb.group({
      // Información básica
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      programId: [null, Validators.required],
      academicPeriodId: [null, Validators.required],
      examType: ['ADMISSION'],
      maxScore: [100, [Validators.required, Validators.min(1)]],
      passingScore: [60, [Validators.required, Validators.min(1)]],
      durationMinutes: [90, [Validators.required, Validators.min(1)]],
      attemptsAllowed: [1, [Validators.min(1)]],
      shuffleQuestions: [false],
      
      // Programación
      scheduleName: [''],
      startDateTime: [null, Validators.required],
      endDateTime: [null, Validators.required],
      location: ['']
    });

    
    this.questionForm = this.fb.group({
      questionText: ['', Validators.required],
      questionType: [QuestionType.MULTIPLE_CHOICE, Validators.required],
      points: [5, [Validators.required, Validators.min(0.1)]]
    });
  }

  initializeFirstQuestion(): void {
    const firstQuestion: Question = {
      id: this.generateId(),
      questionText: '',
      questionType: QuestionType.MULTIPLE_CHOICE,
      points: 5,
      questionFile: null,
      answers: this.createDefaultAnswers(QuestionType.MULTIPLE_CHOICE)
    };
    
    this.questions.set([firstQuestion]);
    this.currentQuestionIndex.set(0);
    this.loadQuestionToForm(0);
  }

  createDefaultAnswers(questionType: QuestionType): Answer[] {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return [
          { id: this.generateId(), answerText: '', isCorrect: false, answerFile: null },
          { id: this.generateId(), answerText: '', isCorrect: false, answerFile: null },
          { id: this.generateId(), answerText: '', isCorrect: false, answerFile: null },
          { id: this.generateId(), answerText: '', isCorrect: false, answerFile: null }
        ];
      case QuestionType.TRUE_FALSE:
        return [
          { id: this.generateId(), answerText: 'Verdadero', isCorrect: false, answerFile: null },
          { id: this.generateId(), answerText: 'Falso', isCorrect: false, answerFile: null }
        ];
      default:
        return [
          { id: this.generateId(), answerText: '', isCorrect: true, answerFile: null }
        ];
    }
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  loadAcademicPeriods(): void {
    this.applicantService.getPeriods().subscribe({
      next: (periods) => {
        this.academicPeriods.set(periods);
      },
      error: (error) => {
        console.error('Error loading academic periods:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los períodos académicos'
        });
      }
    });
  }

  loadQuestionToForm(index: number): void {
    const questions = this.questions();
    if (index >= 0 && index < questions.length) {
      const question = questions[index];
      this.questionForm.patchValue({
        questionText: question.questionText,
        questionType: question.questionType,
        points: question.points
      });
      this.currentQuestionIndex.set(index);
    }
  }

  
  onQuestionTextChange(): void {
    const index = this.currentQuestionIndex();
    const questions = [...this.questions()];
    const questionText = this.questionForm.get('questionText')?.value || '';
    
    if (questions[index]) {
      questions[index].questionText = questionText;
      this.questions.set(questions);
    }
  }

  onPointsChange(): void {
    const index = this.currentQuestionIndex();
    const questions = [...this.questions()];
    const points = this.questionForm.get('points')?.value || 5;
    
    if (questions[index]) {
      questions[index].points = points;
      this.questions.set(questions);
    }
  }

  // Manejo de tipo de pregunta
  onQuestionTypeChange(): void {
    const questionType = this.questionForm.get('questionType')?.value;
    const index = this.currentQuestionIndex();
    const questions = [...this.questions()];
    
    if (questions[index]) {
      questions[index].questionType = questionType;
      questions[index].answers = this.createDefaultAnswers(questionType);
      this.questions.set(questions);
    }
  }

  // Guardar pregunta actual
  saveCurrentQuestion(): void {
    const index = this.currentQuestionIndex();
    const questions = [...this.questions()];
    const formValue = this.questionForm.value;
    
    if (questions[index]) {
      questions[index] = {
        ...questions[index],
        questionText: formValue.questionText,
        questionType: formValue.questionType,
        points: formValue.points
      };
      this.questions.set(questions);
    }
  }

  
  goToQuestion(index: number): void {
    this.loadQuestionToForm(index);
  }

  addQuestion(): void {
    const newQuestion: Question = {
      id: this.generateId(),
      questionText: '',
      questionType: QuestionType.MULTIPLE_CHOICE,
      points: 5,
      questionFile: null,
      answers: this.createDefaultAnswers(QuestionType.MULTIPLE_CHOICE)
    };
    
    const questions = [...this.questions(), newQuestion];
    this.questions.set(questions);
    this.loadQuestionToForm(questions.length - 1);
  }

  removeQuestion(index: number): void {
    const questions = [...this.questions()];
    if (questions.length > 1 && index >= 0 && index < questions.length) {
      questions.splice(index, 1);
      this.questions.set(questions);
      
      
      const currentIndex = this.currentQuestionIndex();
      if (currentIndex >= questions.length) {
        this.loadQuestionToForm(questions.length - 1);
      } else if (currentIndex === index) {
        this.loadQuestionToForm(Math.max(0, index - 1));
      }
    }
  }

  // Manejo de archivos
  onQuestionFileSelect(event: any): void {
  if (!event?.files || event.files.length === 0) return;
  
  const file = event.files[0];
  this.convertFileToBase64(file).then(base64Data => {
    const questionIndex = this.currentQuestionIndex();
    const questions = [...this.questions()];
    
    if (questions[questionIndex]) {
      questions[questionIndex].questionFile = {
        fileName: file.name,
        fileType: file.type,
        data: base64Data,
        fileCategory: ExamFileType.QUESTION_CONTENT 
      };
      this.questions.set(questions);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Archivo cargado',
        detail: `${file.name} se ha cargado correctamente`
      });
    }
  }).catch(error => {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al procesar el archivo'
    });
  });
}


onAnswerFileSelect(event: any, answerIndex: number): void {
  if (!event?.files || event.files.length === 0) return;
  const file = event.files[0];
  this.convertFileToBase64(file).then(base64Data => {
    const questionIndex = this.currentQuestionIndex();
    const questions = [...this.questions()];
    if (questions[questionIndex] && questions[questionIndex].answers[answerIndex]) {
      questions[questionIndex].answers[answerIndex].answerFile = {
        fileName: file.name,
        fileType: file.type,
        data: base64Data,
        fileCategory: ExamFileType.ANSWER_CONTENT 
      };
      this.questions.set(questions);
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Archivo cargado',
      detail: `${file.name} se ha cargado correctamente`
    });
  }).catch(error => {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al procesar el archivo'
    });
  });
}

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.substring(base64String.indexOf(',') + 1);
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Validaciones
  validateQuestions(): boolean {
    const questions = this.questions();
    
    if (questions.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe agregar al menos una pregunta'
      });
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.questionText.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validación',
          detail: `La pregunta ${i + 1} debe tener texto`
        });
        return false;
      }

      
      if (question.questionType === QuestionType.MULTIPLE_CHOICE || 
          question.questionType === QuestionType.TRUE_FALSE) {
        
        const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
        if (!hasCorrectAnswer) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Validación',
            detail: `La pregunta ${i + 1} debe tener al menos una respuesta correcta`
          });
          return false;
        }

       
        const hasEmptyAnswer = question.answers.some(answer => !answer.answerText.trim());
        if (hasEmptyAnswer) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Validación',
            detail: `Todas las respuestas de la pregunta ${i + 1} deben tener texto`
          });
          return false;
        }
      }
    }

    return true;
  }

  loadPrograms(): void {
    this.applicantService.getPrograms().subscribe({
      next: (programs) => {
        this.programs.set(programs);
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los programas'
        });
      }
    });
  }

  
private convertToLocalDateTime(date: Date): string {
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString();
}


onSubmit(): void {
  if (this.examForm.invalid) {
    this.markFormGroupTouched(this.examForm);
    this.messageService.add({
      severity: 'error',
      summary: 'Formulario inválido',
      detail: 'Por favor, complete todos los campos requeridos'
    });
    return;
  }

  if (!this.validateQuestions()) {
    return;
  }

  this.loading.set(true);

  if (this.editMode && this.examId) {
    this.updateExam();
  } else {
    this.createExam();
  }
}

private updateExam(): void {
  if (!this.examId) return;

  const formValue = this.examForm.value;
  const questions = this.questions();
    const currentStatus = this.originalExamData?.status || ExamStatus.DRAFT;

  const updateRequest: ExamUpdateRequest = {
    name: formValue.name,
    description: formValue.description,
    programId: formValue.programId,
    academicPeriodId: formValue.academicPeriodId,
    status: ExamStatus[currentStatus as keyof typeof ExamStatus] || ExamStatus.DRAFT,
    maxScore: formValue.maxScore,
    durationMinutes: formValue.durationMinutes,
    passingScore: formValue.passingScore,
    attemptsAllowed: formValue.attemptsAllowed,
    shuffleQuestions: formValue.shuffleQuestions,
    schedule: {
      name: formValue.scheduleName || '',
      startDateTime: this.convertToLocalDateTime(formValue.startDateTime),
      endDateTime: this.convertToLocalDateTime(formValue.endDateTime),
      location: formValue.location || ''
    },
   
    examFile: this.originalExamData?.examFile,
    
    questions: questions.map((q, index) => ({
      id: parseInt(q.id), 
      questionText: q.questionText,
      questionType: q.questionType,
      position: index + 1,
      points: q.points,
      questionFile: q.questionFile,
      answers: q.answers.map(a => ({
        id: parseInt(a.id), 
        answerText: a.answerText,
        isCorrect: a.isCorrect,
        answerFile: a.answerFile
      }))
    }))
  };

  this.loading.set(true);
  this.applicantService.updateExam(this.examId, updateRequest).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Examen actualizado',
        detail: response.message,
        life: 5000
      });
      this.examUpdated.emit();
    },
    error: (error) => {
      console.error('Error updating exam:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error al actualizar',
        detail: 'No se pudo actualizar el examen. Intente nuevamente.',
        life: 5000
      });
      this.loading.set(false);
    }
  });
}

private createExam(): void {
  const formValue = this.examForm.value;
  const questions = this.questions();
  
  const examRequest: ExamCreateRequest = {
    name: formValue.name,
    description: formValue.description,
    programId: formValue.programId,
    academicPeriodId: formValue.academicPeriodId,
    examType: formValue.examType,
    maxScore: formValue.maxScore,
    passingScore: formValue.passingScore,
    durationMinutes: formValue.durationMinutes,
    attemptsAllowed: formValue.attemptsAllowed,
    shuffleQuestions: formValue.shuffleQuestions,
    schedule: {
      name: formValue.scheduleName,
      startDateTime: this.convertToLocalDateTime(formValue.startDateTime),
      endDateTime: this.convertToLocalDateTime(formValue.endDateTime),
      location: formValue.location,
      scheduleType: "EXAM"
    },
    questions: questions.map((q, index) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      position: index + 1,
      points: q.points,
      questionFile: q.questionFile,
      answers: q.answers.map(a => ({
        answerText: a.answerText,
        isCorrect: a.isCorrect,
        answerFile: a.answerFile
      }))
    }))
  };

  this.applicantService.createExam(examRequest).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: ' Examen creado',
        detail: response.message,
        life: 5000
      });
      this.examCreated.emit();
    },
    error: (error) => {
      console.error('Error creating exam:', error);
      this.messageService.add({
        severity: 'error',
        summary: ' Error al crear',
        detail: 'No se pudo crear el examen. Intente nuevamente.',
        life: 5000
      });
      this.loading.set(false);
    }
  });
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  showExcelOption(): void {
    this.showExcelUpload.set(true);
  }

  hideExcelOption(): void {
    this.showExcelUpload.set(false);
    
  }

  onSwitchToManual(): void {
    this.showExcelUpload.set(false); 
    this.switchToManual.emit(); 
  }

  // --- Métodos auxiliares para el template ---
  getCurrentQuestion(): Question | null {
    const index = this.currentQuestionIndex();
    return this.questions()[index] || null;
  }

  shouldShowAnswers(): boolean {
    const questionType = this.questionForm.get('questionType')?.value;
    return questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.TRUE_FALSE;
  }

  shouldShowAddAnswerButton(): boolean {
    const questionType = this.questionForm.get('questionType')?.value;
    return questionType === QuestionType.MULTIPLE_CHOICE;
  }

  addAnswer(): void {
    const questionIndex = this.currentQuestionIndex();
    const questions = [...this.questions()];
    if (questions[questionIndex]) {
      questions[questionIndex].answers.push({
        id: this.generateId(),
        answerText: '',
        isCorrect: false,
        answerFile: null
      });
      this.questions.set(questions);
    }
  }

  getCurrentAnswers(): Answer[] {
    const index = this.currentQuestionIndex();
    return this.questions()[index]?.answers || [];
  }

  canRemoveAnswer(answerIndex: number): boolean {
    return this.getCurrentAnswers().length > 1;
  }

  removeAnswer(answerIndex: number): void {
    const questionIndex = this.currentQuestionIndex();
    const questions = [...this.questions()];
    if (questions[questionIndex] && questions[questionIndex].answers.length > 1) {
      questions[questionIndex].answers.splice(answerIndex, 1);
      this.questions.set(questions);
    }
  }

  removeQuestionFile(): void {
  const questionIndex = this.currentQuestionIndex();
  const questions = [...this.questions()];
  
  if (questions[questionIndex]) {
    questions[questionIndex].questionFile = null;
    this.questions.set(questions);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Archivo eliminado',
      detail: 'El archivo ha sido eliminado'
    });
  }
}

removeAnswerFile(answerIndex: number): void {
  const questionIndex = this.currentQuestionIndex();
  const questions = [...this.questions()];
  
  if (questions[questionIndex] && questions[questionIndex].answers[answerIndex]) {
    questions[questionIndex].answers[answerIndex].answerFile = null;
    this.questions.set(questions);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Archivo eliminado',
      detail: 'El archivo ha sido eliminado'
    });
  }
}

  isFormValid(): boolean {
    return this.examForm.valid && this.questions().length > 0;
  }

  private loadExamForEdit(): void {
    if (!this.examId) return;
    
    this.loading.set(true);
    this.applicantService.getExamById(this.examId).subscribe({
      next: (examData) => {
        this.originalExamData = examData;
        this.populateFormWithExamData(examData);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading exam for edit:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el examen para editar'
        });
        this.loading.set(false);
      }
    });
  }

  private populateFormWithExamData(examData: ExamDetailResponse): void {
    
    this.examForm.patchValue({
      name: examData.name,
      description: examData.description,
      programId: examData.programId,
      academicPeriodId: examData.academicPeriodId,
      maxScore: examData.maxScore,
      passingScore: examData.passingScore,
      durationMinutes: examData.durationMinutes,
      attemptsAllowed: examData.attemptsAllowed,
      shuffleQuestions: examData.shuffleQuestions,
      scheduleName: examData.schedule?.name,
      startDateTime: examData.schedule?.startDateTime ? new Date(examData.schedule.startDateTime) : null,
      endDateTime: examData.schedule?.endDateTime ? new Date(examData.schedule.endDateTime) : null,
      location: examData.schedule?.location
    });

    
    const convertedQuestions: Question[] = examData.questions
      .sort((a, b) => a.position - b.position)
      .map(q => ({
        id: q.id.toString(),
        questionText: q.questionText,
        questionType: q.questionType as QuestionType,
        points: q.points,
        questionFile: q.questionFile ? {
          fileName: q.questionFile.fileName,
          fileType: q.questionFile.fileType,
          data: q.questionFile.data,
          fileCategory: q.questionFile.fileCategory
        } : null,
        answers: q.answers.map(a => ({
          id: a.id.toString(),
          answerText: a.answerText,
          isCorrect: a.isCorrect,
          answerFile: a.answerFile ? {
            fileName: a.answerFile.fileName,
            fileType: a.answerFile.fileType,
            data: a.answerFile.data,
            fileCategory: a.answerFile.fileCategory
          } : null
        }))
      }));

    this.questions.set(convertedQuestions);
    
    
    if (convertedQuestions.length > 0) {
      this.loadQuestionToForm(0);
    }
  }
}
