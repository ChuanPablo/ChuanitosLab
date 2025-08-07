import { Component, effect, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { User } from '@lab/shared-interfaces';
import {
  DialogService,
  UserAuthUtilsService,
  UserService,
} from '@lab/core-services';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserCardComponent } from '@lab/user-ui';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { Utilities } from '@lab/shared-utils';
import { UserRegistrationWizardComponent } from '../user-registration-wizard/user-registration-wizard.component';

@Component({
  selector: 'lib-layout-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    UserCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  public static readonly USER_LIMIT = 6;
  private errorMessage = signal('');
  private userService = inject(UserService);
  private authUtils = inject(UserAuthUtilsService);
  private dialogService = inject(DialogService);

  public users: Signal<User[]> = toSignal(
    this.userService.getAllUsersLimited(DashboardComponent.USER_LIMIT).pipe(
      tap(() => this.errorMessage.set('')),
      catchError((error: any) => {
        this.errorMessage.set(error.message);
        return of<User[]>([]);
      })
    ),
    { initialValue: [] }
  );

  // Bindings
  public readonly canAddUser = this.authUtils.canAddUser;
  public readonly isAdmin = this.authUtils.isAdmin;
  public readonly trackByUserId = Utilities.trackByUserId;

  constructor(private snackBar: MatSnackBar) {
    effect(() => {
      const error = this.errorMessage();
      if (error) {
        console.log(`opening snackbar for error: ${error}`);
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['snack-bar'],
        });
      }
    });
  }

  onAddUser() {
    this.dialogService.openGenericDialog({
      title: 'Add User',
      componentClass: UserRegistrationWizardComponent,
    });
  }

  onEditUser(user: User) {
    this.dialogService.openGenericDialog({
      title: 'Edit User',
      componentClass: EditUserComponent,
      componentInputs: { user },
    });
  }

  onDeleteUser(user: User) {
    console.log('Delete user:', user);
    // Implement delete logic with confirmation
  }

  onToggleStatus(user: User) {
    console.log('Toggle status for user:', user);
    // Implement status toggle logic
  }

  onViewDetails(user: User) {
    this.dialogService.openGenericDialog({
      title: 'User Details',
      componentClass: UserDetailComponent,
      componentInputs: { inputUser: user },
    });
  }
}
