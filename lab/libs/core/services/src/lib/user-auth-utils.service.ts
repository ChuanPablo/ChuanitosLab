import { Injectable, inject, signal, computed } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { User } from '@lab/shared-interfaces';
import { catchError, of, tap } from 'rxjs';

/**
 * @summary Utility service for user authentication and authorization checks
 * @description Provides convenient methods to check user permissions and identity
 */
@Injectable({
  providedIn: 'root'
})
export class UserAuthUtilsService {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  private _currentUser = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);

  // Computed signals for convenient access
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isLoggedIn = this.authService.isLoggedIn;

  public readonly isAdmin = computed(()=> {
    const user = this._currentUser();
    return user ? user.isStaff || user.isSuperuser : false;
  })

  public readonly isStaff = computed(() => {
    const user = this._currentUser();
    return user ? user.isStaff : false;
  });

  public readonly isSuperuser = computed(() => {
    const user = this._currentUser();
    return user ? user.isSuperuser : false;
  });

  public readonly currentUserId = computed(() => {
    const user = this._currentUser();
    return user ? user.id : null;
  });

  constructor() {
    // Load current user if logged in
    if (this.authService.isLoggedIn()) {
      this.loadCurrentUser();
    }

    // Subscribe to auth events
    this.authService.userLoggedIn.subscribe(() => {
      this.loadCurrentUser();
    });

    this.authService.userLoggedOut.subscribe(() => {
      this.clearCurrentUser();
    });
  }

  /**
   * @summary Loads the current user data
   * @description Fetches current user data and updates the signal
   */
  public loadCurrentUser(): void {
    if (!this.authService.isLoggedIn()) {
      this._currentUser.set(null);
      return;
    }

    this._isLoading.set(true);
    this.userService.getCurrentUser().pipe(
      tap(user => {
        this._currentUser.set(user);
        this._isLoading.set(false);
      }),
      catchError(error => {
        console.error('Failed to load current user:', error);

        // If we get a 401, the token is invalid - logout the user
        if (error.status === 401) {
          this.authService.logout();
        }

        this._currentUser.set(null);
        this._isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * @summary Checks if the given userId matches the current logged-in user
   * @param userId - The user ID to check against current user
   * @returns boolean indicating if the userId matches current user
   */
  public isCurrentUser(userId: number): boolean {
    return this.currentUserId() !== null && this.currentUserId() === userId;
  }

  /**
   * @summary Checks if the current user can add users (and skip email verification)
   * @description Superusers can add users without email verification
   * @returns boolean indicating if current user can edit the specified user
   */
  public readonly canAddUser = this.isSuperuser;

  /**
   * @summary Checks if the current user can edit the given user
   * @description User can edit if they are the same user or if current user is admin
   * @param userId - The user ID to check edit permissions for
   * @returns boolean indicating if current user can edit the specified user
   */
  public canEditUser(userId: number): boolean {
    return this.isCurrentUser(userId) || this.isStaff();
  }

  /**
   * @summary Checks if the current user can delete the given user
   * @description Only admins can delete users, and superusers can delete staff
   * @param userId - The user ID to check delete permissions for
   * @param targetUserIsStaff - Whether the target user is staff (optional, defaults to false)
   * @returns boolean indicating if current user can delete the specified user
   */
  public canDeleteUser(userId: number, targetUserIsStaff = false): boolean {
    // Can't delete yourself
    if (this.isCurrentUser(userId)) {
      return false;
    }

    // Only staff can delete users
    if (!this.isStaff()) {
      return false;
    }

    // Staff can delete regular users, superusers can delete anyone
    if (targetUserIsStaff && !this.isSuperuser()) {
      return false;
    }

    return true;
  }

  /**
   * @summary Clears the current user data
   * @description Called when user logs out
   */
  public clearCurrentUser(): void {
    this._currentUser.set(null);
  }

  /**
   * @summary Gets the current user data (one-time access)
   * @returns User object or null if not logged in
   */
  public getCurrentUserSnapshot(): User | null {
    return this._currentUser();
  }
}
