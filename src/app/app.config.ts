import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app-routing.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthGuard } from './guards/auth-guard.service';

// PrimeNG modules (imported directly in components)
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Register Spanish locale data
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: navigator.language },
    ConfirmationService,
    MessageService,
    AuthGuard
  ]
};
