export interface ChartDataDTO {
  name: string;
  value: number;
}

export type ChartDimension =
  | 'gender'
  | 'age'
  | 'applicantType'
  | 'district'
  | 'province'
  | 'department'
  | 'schoolType'
  | 'status'
  | 'program'
  | 'contactMethod'
  | 'disability'
  | 'academicPeriod'
  | 'score';

export interface DashboardFilterRequest {
  chartDimension: ChartDimension;
  gender?: string;
  ageFrom?: number;
  ageTo?: number;
  applicantType?: string;
  departmentCode?: string;
  provinceCode?: string;
  districtCode?: string;
  schoolType?: string;
  status?: string;
  registrationDateFrom?: string; // ISO string
  registrationDateTo?: string; // ISO string
  scoreFrom?: number;
  scoreTo?: number;
  programId?: number;
  contactMethod?: string;
  disabilityType?: string;
  academicPeriod?: string;
}