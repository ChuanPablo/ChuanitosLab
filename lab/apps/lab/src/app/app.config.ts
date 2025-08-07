import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  authInterceptor,
  AuthService,
  ConfigService,
} from '@lab/core-services';
import { of, switchMap } from 'rxjs';
import { GENERIC_DIALOG_COMPONENT } from '@lab/injection-tokens';
import { GenericDialogComponent } from '@lab/shared-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      const authService = inject(AuthService);

      return configService.loadConfig().pipe(
        switchMap(() => {
          if (authService.isLoggedIn()) {
            return authService.validateToken();
          }
          return of(true);
        })
      );
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule),
    {
      provide: GENERIC_DIALOG_COMPONENT,
      useValue: GenericDialogComponent,
    },
  ],
};
