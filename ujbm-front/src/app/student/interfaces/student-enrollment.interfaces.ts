import { BaseFilterRequest, BasePage } from "@shared/utils/base-table.component";
import { EnrollmentStatus } from "../components/student-enrollment-registry/student-enrollment-registry.component";

export interface EnrollmentStatusWithAvailableCourseSectionsResponse {
  enrollmentStatus: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  enrollmentId: number;
  studentName: string;
  studentLastName: string;
  studentCycle: number;
  academicPeriodName: string;
  academicPeriodId: number;
  availableSections: CourseSectionWithDetailStatusResponse[];
}

export interface CourseSectionWithDetailStatusResponse {
  courseSection: CourseSectionResponse;
  enrollmentDetailStatus: string;
  enrollmentDetailId: number;
}

export interface CourseSectionResponse {
  id: number;
  course: {
    id: number;
    code: string;
    name: string;
    credits: number;
    cycle: number;
    programId: number;
  };
  section: string;
  teacherId: number;
  teacherName: string;
  vacancies: number;
  academicPeriodId: number;
  academicPeriodName: string;
  weeklySchedules: {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
}

export interface EnrollmentRequest {
  enrollmentDetailIds: number[];
}

export interface EnrollmentResponse {
  id: number;
  code: string;
  enrollmentDate: string;
  status: string;
  details: EnrollmentDetailResponse[];
}

export interface EnrollmentAdminResponse {
  id: number;
  studentCode: string;
  studentName: string;
  programId: number;
  programName: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  academicPeriodId: number;
  academicPeriodName: string;
  totalCourses: number;
}

export interface EnrollmentFilterRequest extends BaseFilterRequest {
  status?: EnrollmentStatus;
  studentName?: string;
  studentCode?: string;
  academicPeriodId?: number;
  programId?: number;
  enrollmentDate?: string | Date; // Permite ambos tipos
}

export interface EnrollmentPage extends BasePage<EnrollmentAdminResponse> {}

export interface EnrollmentDetailResponse {
  id: number;
  courseSectionId: number;
  courseCode: string;
  courseName: string;
  section: string;
  credits: number;
  status: string; // Esto viene como "REGISTERED" del backend
}

export interface EnrollmentDetailsResponse {
  id: number;
  enrollmentDate: string;
  status: EnrollmentStatus;
  studentId: number;
  studentCode: string;
  studentName: string;
  programId: number;
  programName: string;
  academicPeriodId: number;
  academicPeriodName: string;
  details: EnrollmentDetailResponse[];
}

export interface ProgramSelectResponse {
  id: number;
  name: string;
}
