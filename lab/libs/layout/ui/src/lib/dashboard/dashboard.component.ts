import { Component, OnInit, inject, signal, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@lab/shared-interfaces';
import { UserCardComponent} from '@lab/user-ui';
import { UserService } from '@lab/core-services';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDetailDialogComponent } from './../user-detail-dialog/user-detail-dialog.component';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';

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
export class DashboardComponent implements OnInit {
  private errorMessage = signal('');
  private tempUsers!: User[]; // dummy User[] array
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  public users: Signal<User[]> = toSignal(
    this.userService.getAllUsers().pipe(
      tap(() => this.errorMessage.set('')),
      catchError((error: any ) => {
        this.errorMessage.set(error.message);
        return of<User[]>([]);
      })
    ),
    { initialValue: this.tempUsers }
  );

  constructor(private snackBar: MatSnackBar) {
    effect( () => {
      console.log('effect happening')
      const error = this.errorMessage();
      console.log(error);
      if (error) {
        console.log(`opening snackbar for error: ${error}`);
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['snack-bar'],
        });
      }
    })
  }

  ngOnInit() {
    this.tempUsers = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        username: 'JohnnyFix',
        status: 'active',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        joinDate: new Date('2023-01-15'),
        isStaff: false,
        isSuperuser: false,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        username: 'ThisIsJane',
        status: 'active',
        lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        joinDate: new Date('2022-11-20'),
        isStaff: false,
        isSuperuser: false,
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        username: 'PrisonMike',
        status: 'inactive',
        lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        joinDate: new Date('2023-03-10'),
        isStaff: false,
        isSuperuser: false,
      },
      {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        username: 'SillySarah',
        status: 'inactive',
        joinDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isStaff: false,
        isSuperuser: false,
      },
    ];
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  onEditUser(user: User) {
    console.log('Edit user:', user);
    console.log('View details for user:', user);

    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      data: { user },
      width: '95vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'user-detail-dialog',
      autoFocus: false,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
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

    const dialogRef = this.dialog.open(UserDetailDialogComponent, {
      data: { user },
      width: '95vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'user-detail-dialog',
      autoFocus: false,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
        // Handle any actions from the dialog if needed
      }
    });
  }
}
