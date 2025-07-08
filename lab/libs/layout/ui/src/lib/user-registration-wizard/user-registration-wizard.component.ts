import { Component, inject, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '@lab/core-services';
import { EmailSubmissionResponse, CodeVerificationResponse, UserRegistrationResponse } from '@lab/shared-interfaces';
import { Utilities } from '@lab/shared-utils';

/**
 * @summary Component for the user registration wizard
 * @description
 * This component provides a multistep form for user registration.
 * It uses the `MatStepperModule` to navigate between form steps.
 * It emits an event when the user registration was successful in order for a wrapping dialog to catch it and close automatically.
 * @see GenericDialogComponent
 * @emits wizardCompleted - Emitted when the wizard is completed
 */
@Component({
  selector: 'lib-layout-user-registration-wizard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule
  ],
  templateUrl: './user-registration-wizard.component.html',
  styleUrls: ['./user-registration-wizard.component.scss'],
})
export class UserRegistrationWizardComponent implements OnInit {
  // Event emitters
  @Output() wizardCompleted = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // Form groups for each step
  emailForm!: FormGroup;
  codeForm!: FormGroup;
  registrationForm!: FormGroup;

  // Loading states
  isSubmittingEmail = false;
  isVerifyingCode = false;
  isRegistering = false;

  // Step tracking
  currentStep = 0;
  isEmailVerified = false;
  isEmailSubmitted = false;
  isRegistrationCompleted = false;

  ngOnInit() {
    this.initializeForms();
  }

  private initializeForms() {
    // Step 1: Email form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Step 2: Code verification form
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Step 3: Registration form
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password confirmation
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');

    if (password && passwordConfirm && password.value !== passwordConfirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Step 1: Submit email
  async onSubmitEmail() {
    if (this.emailForm.valid) {
      this.isSubmittingEmail = true;

      try {
        const email = this.emailForm.get('email')?.value;
        const response: EmailSubmissionResponse = await this.authService.submitEmail(email);

        if (response.success && response.message) {
          this.isEmailSubmitted = true;
          this.snackBar.open(response.message, 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.currentStep = 1;
        } else {
          this.handleEmailError(response);
        }
      } catch (error: any) {
        this.handleEmailError(error);
      } finally {
        this.isSubmittingEmail = false;
      }
    }
  }

  private handleEmailError(error: any) {
    let errorMessage = 'Failed to send verification code. Please try again.';

    if (error?.email) {
      if (Array.isArray(error.email)) {
        errorMessage = error.email[0];
      } else {
        errorMessage = error.email;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Step 2: Verify code
  async onVerifyCode() {
    if (this.codeForm.valid) {
      this.isVerifyingCode = true;

      try {
        const email = this.emailForm.get('email')?.value;
        const code = this.codeForm.get('code')?.value;
        const response: CodeVerificationResponse = await this.authService.verifyCode(email, code);

        if (response.message && !response.non_field_errors) {
          this.isEmailVerified = true;
          this.snackBar.open('Email verified successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.currentStep = 2;
        } else {
          this.handleCodeError(response);
        }
      } catch (error: any) {
        this.handleCodeError(error);
      } finally {
        this.isVerifyingCode = false;
      }
    }
  }

  private handleCodeError(error: any) {
    const errorMessage = error.non_field_errors ? error.non_field_errors[0] : 'Invalid verification code. Please try again.';

    if (error?.non_field_errors && error.non_field_errors.length > 0) {
      console.log(error.non_field_errors[0]);
    } else if (error?.message) {
      console.log(error.message);
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Step 3: Complete registration
  async onCompleteRegistration() {
    if (this.registrationForm.valid && this.isEmailVerified) {
      this.isRegistering = true;

      // disable form inputs
      this.emailForm.disable();
      this.codeForm.disable();
      this.registrationForm.disable();

      try {
        const formData = new FormData();
        const email = this.emailForm.get('email')?.value;
        const formValues = this.registrationForm.value;

        formData.append('email', email);
        formData.append('username', formValues.username);
        formData.append('password', formValues.password);
        formData.append('password_confirm', formValues.passwordConfirm);
        formData.append('first_name', formValues.firstName);
        formData.append('last_name', formValues.lastName);

        const response: UserRegistrationResponse = await this.authService.register(formData);

        if (response.user_id) {
          this.isRegistrationCompleted = true;
          this.snackBar.open('Registration completed successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });

          // emit event after successful registration
          this.wizardCompleted.emit();
        } else {
          this.handleRegistrationError(response);
        }
      } catch (error: any) {
        this.handleRegistrationError(error);
      } finally {
        this.isRegistering = false;
      }
    }
  }

  private handleRegistrationError(error: any) {
    let errorMessage = 'Registration failed. Please try again.';

    if (error?.error) {
      errorMessage = error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Navigation methods
  goBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
      // Reset completion state for steps that haven't been completed yet
      if (this.currentStep === 0) {
        this.isEmailVerified = false;
        this.isRegistrationCompleted = false;
      } else if (this.currentStep === 1) {
        this.isRegistrationCompleted = false;
      }
    }
  }

  // Utility methods
  getEmailErrorMessage(): string {
    const emailControl = this.emailForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getCodeErrorMessage(): string {
    const codeControl = this.codeForm.get('code');
    if (codeControl?.hasError('required')) {
      return 'Verification code is required';
    }
    if (codeControl?.hasError('pattern')) {
      return 'Please enter a 6-digit code';
    }
    return '';
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${Utilities.getFormFieldDisplayNames(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${Utilities.getFormFieldDisplayNames(fieldName)} must be at least ${minLength} characters`;
    }
    return '';
  }

  getPasswordConfirmErrorMessage(): string {
    const control = this.registrationForm.get('passwordConfirm');
    if (control?.hasError('required')) {
      return 'Password confirmation is required';
    }
    if (this.registrationForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
