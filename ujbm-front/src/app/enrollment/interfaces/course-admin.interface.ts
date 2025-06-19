import { BaseFilterRequest, BasePage } from "@shared/utils/base-table.component";

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  cycle: number;
  programId: number;
}

export interface CourseRequest {
  code: string;
  name: string;
  credits: number;
  cycle: number;
  programId: number;
}

export interface CoursePage {
  content: CourseResponse[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CourseFilterRequest extends BaseFilterRequest {
  code?: string;
  name?: string;
  credits?: number;
  cycle?: number;
  programId?: number;
}

export interface CoursePage extends BasePage<CourseResponse> {}