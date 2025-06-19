import { Component } from '@angular/core';
import { ApplicantReceiptComponent } from '../../components/applicant-payment/applicant-payment.component';
import { AppConfigurator } from "../../../layout/component/app.configurator";
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { AppFooter } from "../../../layout/component/app.footer";

@Component({
  selector: 'app-payment-receipt-upload',
  imports: [ApplicantReceiptComponent, AppConfigurator, PageHeaderComponent, AppFooter],
  templateUrl: './payment-receipt-upload.component.html',
  styleUrl: './payment-receipt-upload.component.scss'
})
export default class PaymentReceiptUploadComponent {

}
