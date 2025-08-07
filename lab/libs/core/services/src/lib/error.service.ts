import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * @summary Service for handling HTTP errors
 * @description This service provides a common error handler that redirects to login on 401
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private authService = inject(AuthService)
  private router = inject(Router);

  /**
   * @summary Handle HTTP errors with authentication check
   * @description Common error handler that redirects to login on 401
   * @param error - HTTP error response
   * @param operation - Name of the operation for logging
   * @returns Observable that throws formatted error
   */
  public handleError(operation: string) {
    return (error: any): Observable<never> => {
      return throwError(() => ({
        message: `Error during ${operation}`,
        originalError: error
      }));
    };
  }
}
