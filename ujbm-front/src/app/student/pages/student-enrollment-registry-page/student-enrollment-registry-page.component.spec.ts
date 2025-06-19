import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEnrollmentRegistryPageComponent } from './student-enrollment-registry-page.component';

describe('StudentEnrollmentRegistryPageComponent', () => {
  let component: StudentEnrollmentRegistryPageComponent;
  let fixture: ComponentFixture<StudentEnrollmentRegistryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEnrollmentRegistryPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEnrollmentRegistryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
