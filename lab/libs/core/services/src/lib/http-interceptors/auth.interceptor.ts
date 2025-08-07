import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ApiEndpoints, BaseRoutes } from '@lab/shared-utils';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip interceptor for refresh token and validation endpoints to avoid loops
  const isRefreshTokenRequest = request.url.includes(`/${ApiEndpoints.Token}/${ApiEndpoints.Refresh}/`);
  const isValidationRequest = request.url.includes(`/${ApiEndpoints.Users}/${ApiEndpoints.Me}`);

  if (isRefreshTokenRequest) {
    return next(request);
  }

  const addUpdatedToken = (req: typeof request) => {
    const token = authService.authToken;
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return req;
  }

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401 && !isValidationRequest) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.validateToken().pipe(
            switchMap((isValid) => {
              console.log('Token validated. Result:', isValid);
              isRefreshing = false;

              if (isValid === true) {
                refreshTokenSubject.next(true);
                return next(addUpdatedToken(request)); // Retry original request
              } else {
                refreshTokenSubject.next(false);
                router.navigate(['/', BaseRoutes.Login]);
                return throwError(() => error);
              }
            }),
            catchError((err) => {
              isRefreshing = false;
              refreshTokenSubject.next(false);
              router.navigate(['/', BaseRoutes.Login]);
              return throwError(() => err);
            })
          );
        } else {
          // Wait for the refresh to complete
          return refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap(success => success ? next(addUpdatedToken(request)) : throwError(() => error))
          );
        }
      }

      return throwError(() => error);
    })
  );
};
