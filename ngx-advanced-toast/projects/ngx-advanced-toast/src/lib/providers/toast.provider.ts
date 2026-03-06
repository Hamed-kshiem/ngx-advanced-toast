import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ToastConfig } from '../models/toast.model';
import { TOAST_CONFIG, TOAST_DEFAULT_CONFIG } from '../tokens/toast.tokens';

/**
 * Register the toast system in your app:
 *
 * ```ts
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideToast({ position: 'bottom-right', duration: 3000 })
 *   ]
 * };
 * ```
 */
export function provideToast(config: ToastConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TOAST_CONFIG,
      useValue: { ...TOAST_DEFAULT_CONFIG, ...config },
    },
  ]);
}
