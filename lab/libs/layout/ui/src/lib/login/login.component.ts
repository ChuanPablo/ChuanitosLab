import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService, DialogService } from '@lab/core-services';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RaisedSpinnerButtonComponent } from '@lab/shared-ui';
import { UserRegistrationWizardComponent } from '../user-registration-wizard/user-registration-wizard.component';

@Component({
  selector: 'lib-layout-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    RaisedSpinnerButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
/**
 * Login Component that provides the complete interactive UI for user login
 */
export class LoginComponent implements OnInit {
  /**
   * From group that handles login form
   */
  loginForm!: FormGroup;

  /**
   * Flag if password should be hidden (is handled in UI)
   * @default true
   */
  hidePassword = true;

  /**
   * Flag handling display of loading animation
   * (is set to true as soon the submit button is pressed and the API call has started and set to false in the promise following the API call)
   * @default false
   */
  isLoading = false;

  constructor(
    private authService: AuthService,
    //private storageService: StorageService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    //this.storageService.clear();
    this.initForm();
  }

  /**
   * initializes the reactive loginForm
   */
  initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  /**
   * event handler for when login button is pressed. validates input and calls API
   */
  onLogin() {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.isLoading = true;
      this.authService.login(email, password, rememberMe).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Login successful', 'Close', {
            duration: 500,
            panelClass: ['success-snackbar'],
          });
          this.router.navigate(['/']).then(() => {
            console.log('redirect to home page... ok');
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login failed:', err);
          let errorMessage = 'Login failed. Please try again.';
          if (err.status === 401) {
            errorMessage = 'Invalid email or password.';
          } else if (err.status === 0) {
            errorMessage =
              'Unable to connect to server. Please check your connection.';
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * marks every individual control in login form as 'touched'
   */
  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * evaluates and returns email error messages
   */
  getEmailErrorMessage() {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    return emailControl?.hasError('email')
      ? 'Please enter a valid email address'
      : '';
  }

  /**
   * evaluates and returns password error messages
   */
  getPasswordErrorMessage() {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    return passwordControl?.hasError('minlength')
      ? 'Password must be at least 6 characters'
      : '';
  }

  public onSignup(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dialogService.openGenericDialog({
      title: 'Sign Up',
      componentClass: UserRegistrationWizardComponent,
      //noScroll: true
    });
  }
}
