import { SessionSlot } from "./session-slot.interface";
import { Teacher } from "./teacher.interface";

export interface CourseSchedule {
    scheduleId: string;         // id único para el horario
    section: string;          
    teacher: Teacher;
    modality: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
    sessions: SessionSlot[];    // pa días y horas específicas
  }