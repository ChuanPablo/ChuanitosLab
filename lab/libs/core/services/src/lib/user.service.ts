import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, UserDto } from '@lab/shared-interfaces';
import { ApiEndpoints, UserStatus, LocalStorageKeys } from '@lab/shared-utils';
import { catchError, EMPTY, map, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * @summary Service handling all user management (except authorisation)
 * @description This service provides wrapper functions for all user API endpoints
 * @see AuthService
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private config = inject(ConfigService)
  private auth = inject(AuthService)
  private apiUrl = this.config.apiUrl;

  private isLoggedIn = this.auth.isLoggedIn

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * @summary (Getter) Returns HttpHeaders object containing the Bearer token
   * @description retrieves token from local storage, packs it into a HttpHeaders object and returns it
   * every time it is called
   */
  get headers(): HttpHeaders{
    const token = localStorage.getItem(LocalStorageKeys.AuthToken);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * @summary Maps UserDto to User interface
   * @description Converts DTO fields to interface fields
   * @param userDto - The DTO object from API
   * @returns User object with camelCase properties
   */
  private mapDtoToUser(userDto: UserDto): User {
    return {
      id: userDto.id,
      email: userDto.email,
      username: userDto.username ? userDto.username : '',
      firstName: userDto.first_name ? userDto.first_name : '',
      lastName: userDto.last_name ? userDto.last_name : '',
      avatar: userDto.avatar ? userDto.avatar : '',
      linkedinLink: userDto.linkedin_link ? userDto.linkedin_link : '',
      githubLink: userDto.github_link ? userDto.github_link : '',
      dockerhubLink: userDto.dockerhub_link ? userDto.dockerhub_link : '',
      contactInfo: userDto.contact_info ? userDto.contact_info : '',
      additionalInfo: userDto.additional_info ? userDto.additional_info : '',
      isStaff: userDto.is_staff,
      isSuperuser: userDto.is_superuser,
      status: userDto.is_active ? UserStatus.Active : UserStatus.Inactive,
      lastActive: new Date(userDto.last_online),
      joinDate: new Date(userDto.date_created),
    };
  }

  /**
   * @summary Maps User interface to UserDto for API calls
   * @description Converts interface fields to  DTO fields
   * @param user - The User object
   * @returns UserDto object with snake_case properties
   */
  private mapUserToDto(user: Partial<User>): Partial<UserDto> {
    return {
      email: user.email,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar: user.avatar,
      linkedin_link: user.linkedinLink,
      github_link: user.githubLink,
      dockerhub_link: user.dockerhubLink,
      contact_info: user.contactInfo,
      additional_info: user.additionalInfo,
      is_staff: user.isStaff,
      is_superuser: user.isSuperuser,
      is_active: user.status === UserStatus.Active,
    };
  }

  /**
   * @summary Handle HTTP errors with authentication check
   * @description Common error handler that redirects to login on 401
   * @param error - HTTP error response
   * @param operation - Name of the operation for logging
   * @returns Observable that throws formatted error
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      if (error.status === 401) {
        this.router.navigate(['/login']);
        return EMPTY;
      }
      return throwError(() => ({
        message: `Error during ${operation}`,
        originalError: error
      }));
    };
  }

  /**
   * @summary Retrieves all users from the API and returns a User[] array.
   * @description Sends HTTP request to users API endpoint and maps the UserDto response into User object.
   * It's possible to convert the return value into a signal
   * @example const users = toSignal(this.userService.getAllUsers());
   * @returns Observable<User[]>
   * @throws Observable<never> when something went wrong during fetching of user data / redirects to login page when unauthorized
   */
  getAllUsers(): Observable<User[]> {
    console.log('Making request with URL:', `${this.apiUrl()}${ApiEndpoints.Users}`);
    return this.http.get<UserDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}`, this.isLoggedIn() ? { headers: this.headers } : {})
      .pipe(
        map((users) => users.map(user => this.mapDtoToUser(user))),
        catchError(this.handleError('fetch all users'))
      );
  }

  /**
   * @summary Retrieves a single user by ID
   * @description Sends HTTP GET request to fetch user details
   * @param userId - The ID of the user to retrieve
   * @returns Observable<User>
   * @throws Observable<never> when user not found or unauthorized
   */
  getUserById(userId: number): Observable<User> {
    return this.http.get<UserDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}`, this.isLoggedIn() ? { headers: this.headers } : {})
      .pipe(
        map(userDto => this.mapDtoToUser(userDto)),
        catchError(this.handleError('fetch user by ID'))
      );
  }

  /**
   * @summary Creates a new user
   * @description Sends HTTP POST request to create a new user
   * @param user - The user data to create
   * @returns Observable<User> - The created user
   * @throws Observable<never> when creation fails or unauthorized
   */
  createUser(user: FormData): Observable<User> {
    return this.http.post<UserDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/`, user, { headers: this.headers })
      .pipe(
        map(createdUserDto => this.mapDtoToUser(createdUserDto)),
        catchError(this.handleError('create user'))
      );
  }

  /**
   * @summary Updates an existing user
   * @description Sends HTTP PUT request to update user data
   * @param userId - The ID of the user to update
   * @param user - The updated user data
   * @returns Observable<User> - The updated user
   * @throws Observable<never> when update fails or unauthorized
   */
  updateUser(userId: number, user: FormData): Observable<User> {
    return this.http.patch<UserDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/`, user, { headers: this.headers })
      .pipe(
        map(updatedUserDto => this.mapDtoToUser(updatedUserDto)),
        catchError(this.handleError('update user'))
      );
  }

  /**
   * @summary Deletes a user by ID
   * @description Sends HTTP DELETE request to remove user
   * @param userId - The ID of the user to delete
   * @returns Observable<void>
   * @throws Observable<never> when deletion fails or unauthorized
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/`, { headers: this.headers })
      .pipe(
        catchError(this.handleError('delete user'))
      );
  }

  /**
   * @summary Gets the current authenticated user's profile
   * @description Fetches the profile of the currently logged-in user
   * @returns Observable<User>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<UserDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${ApiEndpoints.Me}`, { headers: this.headers })
      .pipe(
        map(userDto => this.mapDtoToUser(userDto)),
        catchError(this.handleError('fetch current user'))
      );
  }
}
