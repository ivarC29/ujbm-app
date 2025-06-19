import { Faculty } from "./faculty.interfaces";



export interface Program {
  id: number;
  name: string;
  durationInSemesters: number;
  degreeAwarded: string;
  faculty: Faculty;
}

export interface ProgramApplicantsTable {
  id: number;
  name: string;
}

export interface ProgramResponse {
  id: number;
  name: string;
}