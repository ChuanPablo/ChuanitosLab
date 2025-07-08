import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRegistrationWizardComponent } from './user-registration-wizard.component';

describe('UserRegistrationWizardComponent', () => {
  let component: UserRegistrationWizardComponent;
  let fixture: ComponentFixture<UserRegistrationWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRegistrationWizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserRegistrationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
