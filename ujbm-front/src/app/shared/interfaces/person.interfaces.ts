// export type PersonType = 'APPLICANT' | 'STUDENT' | 'TEACHER' | 'ADMIN';
// export type DocumentType = 'DNI' | 'PASS';

export interface Person {
  id: number;
  name: string;
  lastname: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthdate: string; // ISO format: YYYY-MM-DD
  type: string;
}

export interface PersonResponse {
  id: number;
  name: string;
  lastname: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthdate: string;
  type: string;
  enrollmentMode: string;
}
export interface GenderResponse {
  code: number;
  label: string;
}
export interface DisabilityType {
  code: string;
  label: string;
  description: string;
}
export interface PersonResponseApplicantsTable {
  id: number;
  name: string;
  lastname: string;
  enrollmentMode: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  sex?: string;
  location: {
    department: string;
    province: string
    district: string;
    address: string;
  };
  birthdate: string;
  guardian?: {
    name: string;
    lastname: string;
    documentType: string;
    documentNumber: string;
    phoneNumber: string;
    email: string;
    guardianRelationship: string;
  };
  hasDisability: boolean; 
  disabilityType?: string; 
  otherDisabilityDescription?: string;
}
