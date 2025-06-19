import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { primengEsTranslation } from './primeng-es.translation';
import { initializeAuth } from './core/initializers/auth.initializer';
import { AuthService } from './core/services/auth-service.service';
import { RefreshTokenServiceService } from './core/services/refresh-token-service.service';
import { ErrorInterceptor } from './core/interceptors/error-interceptor.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    provideAppInitializer(() => initializeAuth(inject(AuthService), inject(RefreshTokenServiceService))()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        }
      },
      translation: primengEsTranslation
    }),

    // HashStrategy, usar en despliegue a netlify o github pages
    // para evitar problemas de rutas, ya que no se puede usar el router de angular en este caso
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }

  ]
};
