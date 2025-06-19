export interface ExamCreateResponse {
  examId: number;
  message: string;
}

// Request para crear examen
export interface ExamCreateRequest {
  name: string;
  description?: string;
  programId: number;
  courseSectionId?: number;
  academicPeriodId?: number;
  examType: string;
  maxScore: number;
  passingScore: number;
  durationMinutes: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  examFile?: ExamFileRequest;
  schedule: ScheduleCreateRequest;
  questions: QuestionCreateRequest[];
}

// Request para archivo de examen
export interface ExamFileRequest {
  fileName: string;
  fileType: string;
  data: string; // base64 data
}

// Request para programar examen
export interface ScheduleCreateRequest {
  name?: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  location?: string;
  scheduleType: string; // "01" para examen
}

// Request para crear pregunta
export interface QuestionCreateRequest {
  questionText: string;
  questionType: string;
  position: number;
  points: number;
  questionFile?: ExamFileRequest;
  answers: AnswerCreateRequest[];
}

// Request para crear respuesta
export interface AnswerCreateRequest {
  answerText: string;
  isCorrect: boolean;
  answerFile?: ExamFileRequest;
}

// Request para crear examen desde Excel
export interface ExamByExcelRequest {
  file: ExamFileRequest;
  programId: number;
  courseSectionId?: number;
  academicPeriodId?: number;
  examType: string;
  passingScore?: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  examFile?: ExamFileRequest;
  schedule: ScheduleCreateRequest;
}

// Respuesta para listar exámenes
export interface ExamListResponse {
  id: number;
  name: string;
  description: string;
  program: string;
  courseSection: string;
  academicPeriod: string;
  type: string;
  status: string;
  maxScore: string;
  totalQuestions: number;
  durationMinutes: number;
  scheduledDate: string;
  passingScore: string;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
}

// Enum para tipos de horario
export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  ESSAY = "ESSAY",
  FILE_UPLOAD = "FILE_UPLOAD",
  SHORT_ANSWER = "SHORT_ANSWER"
}

// Enum para tipos de horario
export enum ScheduleType {
  EXAM = "EXAM",
  INTERVIEW = "INTERVIEW"
}

export enum ExamFileType {
  QUESTION_RESOURCE = "QUESTION_RESOURCE",
  ANSWER_RESOURCE = "ANSWER_RESOURCE",
  ANSWER = "ANSWER",
  SOLUTION = "SOLUTION",
  INSTRUCTIONS = "INSTRUCTIONS",
  EXAM_CONTENT = "EXAM_CONTENT",
  QUESTION_CONTENT = "QUESTION_CONTENT",
  ANSWER_CONTENT = "ANSWER_CONTENT"
}

export interface ExamDetailResponse {
  id: number;
  name: string;
  description: string;
  programId: number;
  programName: string;
  courseSectionId?: number;
  courseSectionName?: string;
  academicPeriodId: number;
  academicPeriodName: string;
  examType: string;
  status: string;
  maxScore: number;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  schedule: ScheduleResponse;
  examFile?: ExamFileResponse;
  questions: QuestionResponse[];
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  questionType: string;
  position: number;
  points: number;
  questionFile?: ExamFileResponse;
  answers: AnswerResponse[];
}

export interface AnswerResponse {
  id: number;
  answerText: string;
  isCorrect: boolean;
  answerFile?: ExamFileResponse;
}

export interface ExamFileResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileCategory: string;
  data: string;
}

export interface ScheduleResponse {
  id: number;
  name: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  scheduleType: string;
}

export interface ExamUpdateRequest {
  name?: string;
  description?: string;
  programId?: number;
  courseSectionId?: number;
  academicPeriodId?: number;
  status?: string;
  maxScore?: number;
  durationMinutes?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  schedule?: ScheduleUpdateRequest;
  examFile?: ExamFileRequest;
  questions?: QuestionUpdateRequest[];
}

export interface QuestionUpdateRequest {
  id: number;
  questionText: string;
  questionType: string;
  position: number;
  points: number;
  questionFile?: ExamFileRequest;
  answers: AnswerUpdateRequest[];
}

export interface AnswerUpdateRequest {
  id: number;
  answerText: string;
  isCorrect: boolean;
  answerFile?: ExamFileRequest;
}

export interface ScheduleUpdateRequest {
  name: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
}

export interface ExamUpdateResponse {
  id: number;
  message: string;
}

export interface ExamDeleteResponse {
  id: number;
  message: string;
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

export interface ApplicantScorePublicResponse {
  code: string | null;
  fullName: string | null;
  programName: string | null;
  score: number | null;
  approved: boolean;
  message: string;
}