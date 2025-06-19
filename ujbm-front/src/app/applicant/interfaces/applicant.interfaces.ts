import { Person
  , PersonResponseApplicantsTable } from "@shared/interfaces/person.interfaces";
import { Program, ProgramApplicantsTable } from "@shared/interfaces/program.interfaces";
import { D } from "node_modules/@fullcalendar/core/internal-common";
import { BaseFilterRequest, BaseEntity } from '@shared/utils/base-table.component';



export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}


export interface ApplicantStatus {
  code: string;
  displayName: string;
  description: string;
  available: boolean;
}
export interface ApplicantTableInfoResponse extends BaseEntity {
  id: number;
  name: string; 
  fullName: string;
  code: string;
  enrollmentModeCode: string; 
  enrollmentModeName: string;
  documentNumber: string;
  enrolled: boolean;
  hasPaidAdmissionFee: boolean;
  dniValidated: boolean;
  certificateValidated: boolean;
  photoValidated: boolean;
  programId: number;
  programName: string;
  registryDate: string; 
  statusCode: string;
  statusName: string;
  dniFileId: number | null;
  studyCertificateFileId: number | null;
  photoFileId: number | null;
  paymentReceiptFile1Id: number | null; 
  paymentReceiptFile2Id: number | null;
  scoreId: number | null;
  totalScore: number | null;
  isApproved: boolean | null;
}




export interface Page<T> {
  content: T[];
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ApplicantPage {
  content: ApplicantTableInfoResponse[];
  page: {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ApplicantScoreResponse {
  code?: string;
  fullName: string;
  academicPeriodName?: string;
  programName: string;
  totalScore: number;
  answers: string[];
  isApproved: boolean;
}
export interface ScoreRequest {
  totalScore: number;
  answers: string[];
}
export interface ApplicantResponse {
  id: number;
  code: string;
  registryDate: string;
  status: string;
  awarenessMethod: string;
  dniValidated: boolean | null;
  certificateValidated: boolean | null;
  photoValidated: boolean | null;
  programId: number;
  personId: number;
  highSchoolInfoId: number;
  isEnrolled: boolean;
  
 
  dniFileId: number | null;
  studyCertificateFileId: number | null;
  photoFileId: number | null;
  syllabusFileIds: number[];
  
 
  dniPath?: string | null;
  studyCertificatePath?: string | null;
  photoPath?: string | null;
  syllabusPath?: string | null;
  

  person?: {
    id: number;
    name: string;
    lastname: string;
    enrollmentMode?: string;
  };
}
export interface StudentConversionResponse {
  id: number;
  codigo: string;
  nombreCompleto: string;
  programa: string;
  fechaMatricula: string;
  mensaje: string;
}


export interface ApplicantFilterRequest extends BaseFilterRequest {
  fullName: string | null;
  code: string | null;
  documentNumber: string | null;
  programId: number | null;
  statusCode: string | null;
  enrollmentModeCode: string | null; //  es enrollmentModeCode en back 
  registryDate: string | null;
  enrolled: boolean | null;
  available: boolean | null;
  

}

export interface ApplicantRequest extends Person {
  registryDate: string; 
  status:string ; 
  program: Program;
}

export interface ApplicantTableItem extends Person {
  registryDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  program: string;
  type: 'ORDINARIO' | 'PREFERENTE' | 'EXONERADO' | 'TRASLADO';
  dniPath: string;
  studyCertificatePath: string;
  photoPath: string;
  acceptVotes: number;
  rejectVotes: number;
}

export interface AwarenessMethod {
  code: string;
  label: string;
  description: string;
}
export type AwarenessMethodResponse = AwarenessMethod[];

export interface HighSchoolType{
  code: string;
  label: string;
  description: string;
}
export type HighSchoolTypeResponse = HighSchoolType[];

export interface ApplicantResumeResponse {
  id: number;
  code: string;
  fullName: string;
  documentNumber: string;
  programName: string;
  enrollmentModeName: string;
  registryDate: string | Date;
  academicPeriodName: string;
  amount: number;
}