import { Component } from '@angular/core';
import { TeacherScheduleCalendarComponent } from "../../components/teacher-schedule-calendar/teacher-schedule-calendar.component";

@Component({
  selector: 'app-teacher-schedule-page',
  imports: [TeacherScheduleCalendarComponent],
  templateUrl: './teacher-schedule-page.component.html',
  styleUrl: './teacher-schedule-page.component.scss'
})
export default class TeacherSchedulePageComponent {

}
