import { ExamDetailResponse } from './admission&interview.interfaces';

export interface ExamAccessResponse {
  applicantId: number;
  code: string;
  fullName: string;
  programName: string;
  canAccessExam: boolean;
  message: string;
  exam: ExamDetailResponse | null;
}
export interface ExamSubmissionResponse {
  applicantId: number;
  code: string;
  fullName: string;
  message: string;
}

export interface AnswerSubmission {
  questionId: number;
  selectedAnswerIds: number[];
}

export interface ExamSubmissionRequest {
  answers: AnswerSubmission[];
}

export interface ExamQuestion {
  id: number;
  question: string;
  options: ExamOption[];
}

export interface ExamOption {
  letter: string;
  text: string;
}

export interface ExamState {
  currentStep: 'dni-validation' | 'exam-taking' | 'exam-completed';
  applicantData?: ExamAccessResponse;
  currentQuestionIndex: number;
  answers: { [questionId: number]: number[] }; 
  timeRemaining: number;
  isSubmitting: boolean;
}

export interface PendingInterviewApplicantResponse {
  id: number;
  code: string;
  fullName: string;
  documentNumber: string;
  registryDate: string;
  programName: string;
  email: string;
  phone: string;
}

export interface InterviewScoreRequest {
  score: number;
}

export interface ApplicantScoreResponse {
  code: string;
  fullName: string;
  academicPeriodName: string;
  programName: string;
  totalScore: number;
  answers: string[];
  isApproved: boolean;
}