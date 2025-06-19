import { SessionSlot } from "./session-slot.interface";
import { Teacher } from "./teacher.interface";

export interface EnrolledCourse {
  scheduleId: string;        
  section: string;          
  teacher: Teacher;
  modality: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
  sessions: SessionSlot[];    

 
  name: string;               
  credits: number;            
  cycle: number;             
}