import { Component } from '@angular/core';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { AppConfigurator } from "../../../layout/component/app.configurator";
import { ApplicantExamComponent } from "../../components/applicant-exam/applicant-exam.component";

@Component({
  selector: 'app-applicant-exam-page',
  imports: [PageHeaderComponent, AppConfigurator, ApplicantExamComponent],
  templateUrl: './applicant-exam-page.component.html',
  styleUrl: './applicant-exam-page.component.scss'
})
export default class ApplicantExamPageComponent {

}
