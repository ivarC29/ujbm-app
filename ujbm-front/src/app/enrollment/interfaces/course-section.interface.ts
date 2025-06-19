import { BaseEntity, BaseFilterRequest } from "@shared/utils/base-table.component";

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}
export enum PeriodStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  PLANNED = 'PLANNED'
}

export interface CourseSectionRequest {
  courseId: number;
  section: string;
  teacherId: number;
  vacancies: number;
  academicPeriodId: number;
  weeklySchedules: WeeklyScheduleRequest[];
}

export interface CourseSectionResponse {
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

export interface CourseSectionFilterRequest extends BaseFilterRequest {
  id?: number;
  courseId?: number;
  courseName?: string;
  section?: string;
  teacherId?: number;
  teacherName?: string;
  vacancies?: number;
  periodId?: number;
  available?: boolean;
}


export interface Course {
  id: number;
  name: string;
  vacancies: number;
  available: boolean;
}

export interface CourseSelectResponse {
  id: number;
  name: string;
}
export interface Teacher {
  id: number;
  person: Person;
  professionalTitle: string;
  academicDegree: string;
  hireDate: string;
  isFullTime: boolean;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAutocompleteResponse {
  id: number;
  fullName: string;
}

export interface Person {
  id: number;
  name: string;
  lastname: string;
  documentIdType: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthdate: string;
  type: string;
  enrollmentMode: string;
  ubigeo: UbigeoResponse;
  guardianName: string;
  guardianLastname: string;
  guardianPhoneNumber: string;
  guardianEmail: string;
  hasDisability: boolean;
  disabilityType: string;
  disabilityDescription: string;
  gender: string;
  available: boolean;
}

export interface UbigeoResponse {
  id: number;
  department: string;
  province: string;
  district: string;
  code: string;
}

export interface AcademicPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicPeriodSelectResponse {
  id: number;
  name: string;
}

export interface WeeklySchedule {
  id: number;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  courseSectionId: number;
  available: boolean;
}


export interface WeeklyScheduleResponse {
  id: number;
  day: DayOfWeek | string;
  startTime: string; 
  endTime: string;   
  available: boolean;
}

export interface CourseSectionTableInfo {
  id: number;
  courseId: number;
  courseName: string;
  section: string;
  teacherId: number;
  teacherName: string;
  vacancies: number;
  periodId: number;
  periodName: string;
  weeklyScheduleList: WeeklyScheduleResponse[];
}


export interface CourseOption {
  id: number;
  name: string;
  code: string;
}


export interface TeacherOption {
  id: number;
  name: string;
  lastname: string;
  fullName?: string;
}
export interface AcademicPeriodOption {
  id: number;
  name: string;
}

export interface CourseSectionBatchUploadResponse {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
export interface PageResponseTable<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
}

export interface CourseSectionTableInfoResponse extends BaseEntity {
  id: number;
  name: string; 
  courseId: number;
  courseName: string;
  section: string;
  teacherId: number;
  teacherName: string;
  vacancies: number;
  periodId: number;
  periodName: string;
  weeklyScheduleList: WeeklyScheduleResponse[];
}



export interface CourseSectionPage {
  content: CourseSectionTableInfoResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
export interface WeeklyScheduleRequest {
  day: string;
  startTime: string; 
  endTime: string;   
}

export interface CourseSectionBatchUploadResponse {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface PeriodOption {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface BasePage<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}