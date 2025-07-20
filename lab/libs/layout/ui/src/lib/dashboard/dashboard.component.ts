import { Component, OnInit, inject, signal, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@lab/shared-interfaces';
import { UserAuthUtilsService, UserService } from '@lab/core-services';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericDialogComponent } from '@lab/shared-ui';
import { UserCardComponent } from '../user-card/user-card.component';
import { UserRegistrationWizardComponent } from '../user-registration-wizard/user-registration-wizard.component';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { UserDetailComponent } from '../user-detail/user-detail.component';

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
  private errorMessage = signal('');
  private userService = inject(UserService);
  private authUtils = inject(UserAuthUtilsService);
  private dialog = inject(MatDialog);

  public users: Signal<User[]> = toSignal(
    this.userService.getAllUsers().pipe(
      tap(() => this.errorMessage.set('')),
      catchError((error: any) => {
        this.errorMessage.set(error.message);
        return of<User[]>([]);
      })
    ),
    { initialValue: [] }
  );

  public canAddUser = this.authUtils.canAddUser;
  public isAdmin = this.authUtils.isAdmin;

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

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  onAddUser() {
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        title: 'Add User',
        component: UserRegistrationWizardComponent,
      },
      width: '95vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'user-detail-dialog',
      autoFocus: false,
      restoreFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog result:', result);
      }
    });
  }

  onEditUser(user: User) {
    console.log('Edit user:', user);
    console.log('View details for user:', user);

    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        title: 'Edit User',
        component: EditUserComponent,
        componentInputs: { user },
      },
      width: '95vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'user-detail-dialog',
      autoFocus: false,
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog result:', result);
        // Handle any actions from the dialog if needed
      }
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
    console.log('View details for user:', user);

    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        title: 'User Details',
        component: UserDetailComponent,
        componentInputs: { user },
      },
      width: '95vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'user-detail-dialog',
      autoFocus: false,
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog result:', result);

        // Handle editUser event from user-detail component
        if (result.action === 'editUser' && result.data) {
          console.log('Edit user requested from user-detail:', result.data);
          // Close the current dialog and open edit dialog
          this.onEditUser(result.data);
        }
      }
    });
  }
}
