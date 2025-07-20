import { EventEmitter, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { ApiEndpoints, LocalStorageKeys } from '@lab/shared-utils';
import { LocalStorageService } from "./local-storage.service";
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import {
  CodeVerificationResponse,
  EmailSubmissionResponse,
  UserRegistrationResponse
} from '@lab/shared-interfaces';
import { UserAuthUtilsService } from './user-auth-utils.service';

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

  public userLoggedOut = new EventEmitter();
  public userLoggedIn = new EventEmitter();

  get isLoggedIn() {
    return this._isLoggedIn.asReadonly();
  }

  constructor(private http: HttpClient
            , private localStorageService: LocalStorageService
  ) {
    this._isLoggedIn.set(!!this.localStorageService.get(LocalStorageKeys.AuthToken));
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
   */
  login(email: string, password: string){
    return this.http.post<any>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Token}/`, { email, password }).pipe(
      tap( tokenResponse => {
        this.localStorageService.set(LocalStorageKeys.AuthToken, tokenResponse.access);
        this._isLoggedIn.set(true);
        this.userLoggedIn.emit();
      })
    );
  }

  /**
   * @summary: logs out the user
   * @description: clears the local storage and sets the isLoggedIn signal to false
   */
  logout(){
    this.localStorageService.clear();
    this._isLoggedIn.set(false);
    this.userLoggedOut.emit();
  }

}
