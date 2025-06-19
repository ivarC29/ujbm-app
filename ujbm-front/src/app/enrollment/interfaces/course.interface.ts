import { CourseSchedule } from "./course-schedule.interface";

export interface Course {
    id: string;
    code: string;             
    name: string;              
    credits: number;
    cycle: number;             
    isMandatory: boolean;       // es para si es obligatorio por haberlo desaprobado
    schedules: CourseSchedule[]; 
    weeklyHours?: number;
  }