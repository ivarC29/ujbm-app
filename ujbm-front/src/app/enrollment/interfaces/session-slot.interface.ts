export interface SessionSlot {
    id: string; 
    day: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
    startTime: string;          // formato "HH:mm", ej. "08:00"
    endTime: string;            // formato "HH:mm", ej. "10:00"
    classroom: string;          // como "A-204" o "Virtual"

    courseName?: string; 
  }