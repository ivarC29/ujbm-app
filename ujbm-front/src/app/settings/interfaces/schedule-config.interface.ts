export interface ScheduleConfig {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  description?: string;
}
