import { EventEmitter, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config.service';
import { ApiEndpoints, StorageKeys } from '@lab/shared-utils';
import { StorageService } from './storage.service';
import { catchError, firstValueFrom, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import {
  CodeVerificationResponse,
  EmailSubmissionResponse,
  TokenResponse,
  UserRegistrationResponse
} from '@lab/shared-interfaces';

/**
 * @summary Service handling all user authorisation and registration
 * @description This service provides wrapper functions for all user authorisation and registration API endpoints
 * @see UserService
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private config = inject(ConfigService);
  private apiUrl = this.config.apiUrl;
  private _isLoggedIn= signal(false);
  private refreshTokenTimer: any;

  public userLoggedOut = new EventEmitter();
  public userLoggedIn = new EventEmitter();

  get authToken() {
    return this.storageService.get(StorageKeys.AuthToken);
  }

  get isLoggedIn() {
    return this._isLoggedIn.asReadonly();
  }

  constructor(private http: HttpClient
            , private storageService: StorageService
  ) {
    this._isLoggedIn.set(!!this.storageService.get(StorageKeys.AuthToken));

    // Start refresh token timer if user is logged in
    if (this._isLoggedIn()) {
      this.startRefreshTokenTimer();
    }
  }

  /**
   * @summary Submits an email for verification
   * @description Sends HTTP POST with the email to the API to submit for verification
   * @param email
   * @returns Promise containing the response from the API
   */
  submitEmail(email: string): Promise<EmailSubmissionResponse>  {
    return firstValueFrom(
      this.http.post<EmailSubmissionResponse>(
        `${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Auth}/${ApiEndpoints.EmailSubmit}/`, { email }
      ).pipe(
        tap(response => {
          response.success = true;
          return response;
        }),
        catchError(error => {
          return of({ email, message: error.error.message, status: error.status, success: false });
        })
      )
    );
  }

  /**
   * @summary Verifies the code sent to the user's email
   * @description Sends HTTP POST with the email and code to verify the email (After registering the email address,
   *              an email will be sent to the user with a verification code, which can be used to verify the email address)
   * @param email
   * @param code
   */
  verifyCode(email: string, code: string): Promise<CodeVerificationResponse>{
    return firstValueFrom(this.http.post<CodeVerificationResponse>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Auth}/${ApiEndpoints.Verify}/`, { email, code }));
  }

  /**
   * @summary Completes the registrationData registration
   * @description Sends HTTP POST with the registrationData data from the registration form to complete the registrationData registration
   * @param registrationData (FormData)
   * @returns Promise containing the response from the API
   */
  register(registrationData: FormData): Promise<UserRegistrationResponse> {
    return firstValueFrom(this.http.post<UserRegistrationResponse>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Auth}/${ApiEndpoints.Register}/`, registrationData, ));
  }

  /**
   * @summary Attempts to login the user with the given credentials
   * @description Sends HTTP POST with the email and password to attempt to log in the user
   * @param email
   * @param password
   * @param rememberMe If true, stores tokens in localStorage; if false, stores in sessionStorage
   */
  login(email: string, password: string, rememberMe = false){
    return this.http.post<TokenResponse>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Token}/`, { email, password }).pipe(
      tap( tokenResponse => {
        this.storageService.set(StorageKeys.AuthToken, tokenResponse.access, rememberMe);
        this.storageService.set(StorageKeys.RefreshToken, tokenResponse.refresh, rememberMe);
        this._isLoggedIn.set(true);
        this.startRefreshTokenTimer();
        this.userLoggedIn.emit();
      })
    );
  }

  /**
   * @summary: logs out the user
   * @description: clears the local storage and sets the isLoggedIn signal to false
   */
  logout(){
    this.storageService.clear();
    this._isLoggedIn.set(false);
    this.stopRefreshTokenTimer();
    this.userLoggedOut.emit();
  }

  /**
   * @summary Refreshes the access token using the refresh token
   * @description Makes API call to refresh the access token
   * @returns Observable<TokenResponse | null> containing new tokens or null if refresh failed
   */
  refreshToken(): Observable<TokenResponse | null> {
    const refreshToken = this.storageService.get(StorageKeys.RefreshToken);

    if (!refreshToken) {
      console.log('No refresh token available');
      this.logout();
      return of(null);
    }

    // Determine if tokens are stored persistently by checking localStorage
    const isPersistent = localStorage.getItem(StorageKeys.RefreshToken) !== null;

    console.log('Refreshing access token...');
    return this.http.post<TokenResponse>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Token}/${ApiEndpoints.Refresh}/`, {
      refresh: refreshToken
    }).pipe(
      tap(tokenResponse => {
        console.log('Token refreshed successfully');
        this.storageService.set(StorageKeys.AuthToken, tokenResponse.access, isPersistent);
        this.startRefreshTokenTimer();
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Token refresh failed:', error);
        if (error.status === 401) {
          // Refresh token is invalid, logout user
          this.logout();
        }
        return of(null);
      })
    );
  }

  /**
   * @summary Validates the current token by making a test API call
   * @description Makes a lightweight API call to check if the token is still valid
   * If token is invalid (401), attempts to refresh token before logging out
   * @returns Observable<boolean | null> indicating if token is valid
   */
  validateToken():  Observable<boolean | null> {
    const token = this.storageService.get(StorageKeys.AuthToken);

    if (!token) {
      this._isLoggedIn.set(false);
      return of(false);
    }

    // Make a lightweight API call to validate token
    return this.http.get(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${ApiEndpoints.Me}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).pipe(tap(() => {
        // Token is valid, user stays logged in
        console.log('Token validated successfully');
      }),
      map(() => this._isLoggedIn()),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is invalid, try to refresh it
          console.log('Access token expired, attempting refresh...');
          return this.refreshToken().pipe(
            switchMap(refreshResult => {
              if (refreshResult) {
                // Token refreshed successfully, retry validation
                console.log('Token refreshed, retrying validation...');
                return this.validateToken();
              } else {
                // Refresh failed, user will be logged out by refreshToken method
                this.logout();
                return of(null);
              }
            })
          );
        }

        this.logout();
        return of(false);
      })
    );
  }

  /**
   * @summary Checks if user is authenticated with a valid token
   * @description Validates token if user appears logged in but token might be expired
   * @returns Promise<boolean> indicating if user is truly authenticated
   */
  isAuthenticated(): Observable<boolean | null> {
    if (!this._isLoggedIn()) {
      return of(false); // User is not logged in, return false;
    }

    // If we think we're logged in, validate the token
    return this.validateToken();
  }

  /**
   * @summary Starts the automatic token refresh timer
   * @description Sets up a timer to refresh the token before it expires (every 14 minutes)
   * @private
   */
  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer(); // Clear any existing timer

    // Refresh token every 14 minutes (assuming 15-minute token expiry)
    this.refreshTokenTimer = timer(14 * 60 * 1000, 14 * 60 * 1000).subscribe(() => {
      console.log('Auto-refreshing token...');
      this.refreshToken().subscribe();
    });
  }

  /**
   * @summary Stops the automatic token refresh timer
   * @description Clears the refresh token timer
   * @private
   */
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimer) {
      this.refreshTokenTimer.unsubscribe();
      this.refreshTokenTimer = null;
    }
  }

}
