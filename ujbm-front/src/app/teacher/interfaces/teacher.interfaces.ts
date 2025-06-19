import { BaseEntity, BaseFilterRequest, BasePage } from "@shared/utils/base-table.component";

export interface TeacherTableInfoResponse extends BaseEntity {
  id: number;
  code: string;
  name: string;
  lastname: string;
  email: string;
  professionalTitle: string;
  academicDegree: string;
  available?: boolean;
}

export interface TeacherFilterRequest extends BaseFilterRequest {
  fullName?: string;
  email?: string;
  code?: string;
  professionalTitle?: string;
  academicDegree?: string;
  available?: boolean;
}

export interface TeacherPage extends BasePage<TeacherTableInfoResponse> {}

export interface UbigeoRequest {
  departmentCode: string;
  provinceCode: string;
  districtCode: string;
}

export interface PersonRequest {
  name: string;
  lastname: string;
  documentIdType: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  address?: string;
  birthdate: string;
  type?: string;
  enrollmentMode?: string; 
  ubigeo: UbigeoRequest;
  guardianName?: string;
  guardianLastname?: string;
  guardianPhoneNumber?: string;
  guardianEmail?: string;
  hasDisability: boolean;
  disabilityType?: string;
  disabilityDescription?: string;
  gender: string;
  available?: boolean;
}

export interface TeacherCreateRequest {
  person: PersonRequest;
  professionalTitle: string;
  academicDegree: string;
  hireDate?: string;
  isFullTime?: boolean;
}
export interface TeacherCreateResponse {
  id: number;
  name: string;
  lastname: string;
  email: string;
  professionalTitle: string;
  academicDegree: string;
  hireDate: string;
  isFullTime: boolean;
  available: boolean;
}

export interface PersonResponse {
  id: number;
  name: string;
  lastname: string;
  documentIdType: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  address?: string;
  birthdate: string;
  type?: string;
  enrollmentMode?: string;
  ubigeo?: any;
  guardianName?: string;
  guardianLastname?: string;
  guardianPhoneNumber?: string;
  guardianEmail?: string;
  hasDisability: boolean;
  disabilityType?: string;
  disabilityDescription?: string;
  gender: string;
  available?: boolean;
}

export interface TeacherResponse {
  id: number;
  person: PersonResponse;
  professionalTitle: string;
  academicDegree: string;
  hireDate: string;
  isFullTime: boolean;
}

export interface TeacherAutocompleteResponse {
  id: number;
  name: string;
  lastname: string;
  email: string;
}

export interface TeacherCourseSectionResponse {
  id: number;
  course: CourseResponse;
  section: string;
  teacherId: number;
  teacherName: string;
  vacancies: number;
  academicPeriodId: number;
  academicPeriodName: string;
  weeklySchedules: WeeklyScheduleResponse[];
}

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  cycle: number;
  programId: number;
}

export interface WeeklyScheduleResponse {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}