import { Component } from '@angular/core';
import { AppConfigurator } from "../../../layout/component/app.configurator";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { ApplicantInterviewComponent } from "../../components/applicant-interview/applicant-interview.component";

@Component({
  selector: 'app-applicant-interview-page',
  imports: [AppConfigurator, PageHeaderComponent, ApplicantInterviewComponent],
  templateUrl: './applicant-interview-page.component.html',
  styleUrl: './applicant-interview-page.component.scss'
})
export default class ApplicantInterviewPageComponent {

}
