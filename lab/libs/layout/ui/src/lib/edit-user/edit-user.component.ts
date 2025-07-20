import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '@lab/shared-interfaces';
import { UserService } from '@lab/core-services';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvatarComponent } from '@lab/shared-ui';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

/**
 * @summary Edit user component
 * @description
 * This component is used to edit a user
 */
@Component({
  selector: 'lib-layout-edit-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    AvatarComponent,
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit {
  // Inputs ----
  @Input() user?: User;
  @Input() userId?: number;

  // Dependency Injection ----
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);


  // Globals ----
  isLoading = false;
  isSubmittingUser = false;
  error: string | null = null;
  userForm: FormGroup;

  // misc ----
  private originalAvatarUrl = '';

  // Actions ----

  /**
   * @summary 'next' Observable action for 'updateUser'
   * @param user - updated user (API response)
   * @param onSuccess - additional callback function executed on success
   */
  private postUpdateSuccessAction = (user: User, onSuccess?: () => void) => {
    this.user = user;
    onSuccess?.();

    this.loadUserData();

    this.displaySnackbar(this.user.id
      ? 'User updated successfully'
      : 'User added successfully');
  };

  /**
   * @summary 'error' Observable action for 'updateUser'
   * @param error - Error object (API response)
   */
  private postUpdateErrorAction = (error: Error) => {
    this.error = error.message;
    this.displaySnackbar(error.message, false);
  };

  /**
   * @summary Get 'next' and 'error' Observable actions for 'updateUser'
   * @param onSuccess - additional callback function executed on success
   * @example Example usage with updateUser():
   *  this.userService.updateUser(this.user!.id, formData)
   *                          .subscribe(this.getPostUpdateAction( () => this.setOriginalAvatarUrl()));
   */
  private getPostUpdateAction(onSuccess?: () => void) {
    return {
      next: (user: User) => this.postUpdateSuccessAction(user, onSuccess),
      error: (error: Error) => this.postUpdateErrorAction(error),
    }
  }

  // Lifecycle ----
  constructor() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      avatar: [''],
      linkedinLink: [''],
      githubLink: [''],
      dockerhubLink: [''],
      contactInfo: [''],
      additionalInfo: [''],
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.setOriginalAvatarUrl();
  }

  private loadUserData() {
    this.isLoading = true;
    this.error = null;

    // Get param userId
    const userIdString = this.route.snapshot.paramMap.get('userId');

    // Determine userId from: input > route params > user object
    const userId =
      this.userId || (userIdString && parseInt(userIdString)) || this.user?.id;

    if (!userId) {
      // if there is no user ID it means we are creating a new user
      this.isLoading = false;
      return;
    }

    // If user is provided, use it; otherwise fetch from API
    const userObservable = this.user
      ? of(this.user)
      : this.userService.getUserById(userId);

    userObservable
      .pipe(
        catchError((error) => {
          this.error = 'Failed to load user data';
          console.error('Error loading user data:', error);
          return of(this.user);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((user) => {
        this.user = user;
      });

    this.fillUserForm();
  }

  private fillUserForm() {
    if (!this.user) {
      return;
    }

    this.userForm.patchValue({
      email: this.user.email,
      username: this.user.username,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      linkedinLink: this.user.linkedinLink,
      githubLink: this.user.githubLink,
      dockerhubLink: this.user.dockerhubLink,
      contactInfo: this.user.contactInfo,
      additionalInfo: this.user.additionalInfo,
    });
  }

  public onFileSelected(file: File) {
    console.log('File selected', file);
    this.updateAvatar(file);
  }

  private setOriginalAvatarUrl() {
    this.originalAvatarUrl = this.user?.avatar || '';
  }

  private updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    this.userService
      .updateUser(this.user!.id, formData)
      .subscribe(this.getPostUpdateAction());
  }

  public onSubmitUser() {
    if (this.userForm.invalid || !this.user) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmittingUser = true;

    const formValue = this.userForm.value;
    const formData = new FormData();

    formData.append('email', formValue.email);

    if (formValue.username) {
      formData.append('username', formValue.username);
    }
    if (formValue.firstName) {
      formData.append('first_name', formValue.firstName);
    }
    if (formValue.lastName) {
      formData.append('last_name', formValue.lastName);
    }
    if (formValue.avatar) {
      formData.append('avatar', formValue.avatar);
    }
    if (formValue.linkedinLink) {
      formData.append('linkedin_link', formValue.linkedinLink);
    }
    if (formValue.githubLink) {
      formData.append('github_link', formValue.githubLink);
    }
    if (formValue.dockerhubLink) {
      formData.append('dockerhub_link', formValue.dockerhubLink);
    }
    if (formValue.contactInfo) {
      formData.append('contact_info', formValue.contactInfo);
    }
    if (formValue.additionalInfo) {
      formData.append('additional_info', formValue.additionalInfo);
    }

    const operation = this.user.id
      ? this.userService.updateUser(this.user.id, formData)
      : this.userService.createUser(formData);

    operation.pipe(finalize(() => (this.isSubmittingUser = false))).subscribe(
      this.getPostUpdateAction(() => {
        this.onCancelUserForm();
        // update this.originalAvatarUrl in case user presses cancel AFTER confirming a new avatar
        this.setOriginalAvatarUrl();
      })
    );
  }

  public onCancelUserForm(fullReset = false) {
    this.userForm.reset();
    if (fullReset) {
      this.resetAvatar();
    }
  }

  private resetAvatar() {
    const formData = new FormData();
    formData.append('avatar', this.originalAvatarUrl);
    this.userService.updateUser(this.user!.id, formData).subscribe(this.getPostUpdateAction());
  }

  private displaySnackbar(message: string, success = true) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`${success ? 'success' : 'error'}-snackbar`],
    });
  }

  public getAllErrors(form: FormGroup): string {
    const errors: string[] = [];

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          errors.push(`${key}: ${this.getErrorMessage(errorKey, control.errors![errorKey])}`);
        });
      }
    });

    return errors.join(', ');
  }

  public getFieldErrorMessage(fieldName: string) {
    const fieldControl = this.userForm.get(fieldName);
    if (fieldControl?.hasError('required')) {
      return 'Field is required';
    }
    return fieldControl?.hasError('minlength')
      ? 'Field must be at least 2 characters'
      : '';
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    switch (errorKey) {
      case 'required': return 'This field is required';
      case 'email': return 'Invalid email format';
      case 'minlength': return `Minimum length is ${errorValue.requiredLength}`;
      case 'maxlength': return `Maximum length is ${errorValue.requiredLength}`;
      default: return `Invalid ${errorKey}`;
    }
  }
}
