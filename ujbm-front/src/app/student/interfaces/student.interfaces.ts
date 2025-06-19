import { BaseEntity, BaseFilterRequest, BasePage } from "@shared/utils/base-table.component";
import { EnumOptionResponse } from "src/app/applicant/interfaces/enrollment-mode.interface";
import { PersonRequest, PersonResponse } from "src/app/teacher/interfaces/teacher.interfaces";

export interface StudentTableInfoResponse extends BaseEntity {
  id: number;
  name: string; // Required by BaseEntity - will be mapped from fullName
  code: string;
  fullName: string;
  email: string;
  enrollmentModeCode: string;
  enrollmentModeName: string;
  programId: number;
  programName: string;
  cycle: number
  available: boolean;
}

export interface StudentFilterRequest extends BaseFilterRequest {
  code?: string;
  fullName?: string;
  email?: string;
  enrollmentModeCode?: string;
  enrollmentModeName?: string;
  programId?: string;
  programName?: string;
  cycle?: number;
  available?: boolean;
}

export interface StudentPage extends BasePage<StudentTableInfoResponse> {}

export interface StudentCreateResponse {
  studentId: number;
  code: string;
  fullName: string;
  email: string;
  message: string;
}

export interface StudentRequest {
  enrollmentDate: string; 
  programId: number;
  cycle: number;
  person: PersonRequest;
}

export interface StudentResponse {
  id: number;
  code: string;
  enrollmentDate: string;
  programId: number;
  cycle: number;
  person: PersonResponse;
}


export interface EnrollmentStatusEnum extends EnumOptionResponse {}

export interface EnrollmentDetailStatusEnum extends EnumOptionResponse {}

// --- Mis Cursos: Interfaces para matrícula y horarios ---

export interface EnrollmentDetailsWithScheduleResponse {
  id: number;
  enrollmentDate: string;
  status: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  programId: number;
  programName: string;
  academicPeriodId: number;
  academicPeriodName: string;
  details: EnrollmentDetailWithScheduleResponse[];
}

export interface EnrollmentDetailWithScheduleResponse {
  id: number;
  courseSectionId: number;
  courseCode: string;
  courseName: string;
  section: string;
  credits: number;
  status: string;
  teacherName: string;
  schedules: WeeklyScheduleResponse[];
}

export interface WeeklyScheduleResponse {
  id: number;
  day: string; 
  startTime: string; 
  endTime: string;   
  available: boolean;
}


