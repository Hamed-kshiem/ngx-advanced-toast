import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToast } from 'ngx-advanced-toast';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideToast({
      position: 'top-right',
      duration: 4000,
      maxVisible: 5,
      dismissible: true,
      showProgress: true,
      animationDuration: 300,
      gap: 12,
    }),
  ],
};
