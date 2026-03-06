import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { ToastOptions } from '../models/toast.model';

/**
 * ToastLogger wraps ToastService and mirrors every notification to
 * the browser console. Use this in application code when you want a
 * persistent console audit trail alongside visible toasts.
 *
 * Console format: [TOAST][TYPE] Title: message
 */
@Injectable({ providedIn: 'root' })
export class ToastLogger {
  private readonly _toast = inject(ToastService);

  // ─── Public API ───────────────────────────────────────────────────────────

  show(options: ToastOptions): string {
    this._log('log', options.type?.toUpperCase() ?? 'DEFAULT', options);
    return this._toast.show(options);
  }

  success(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    this._log('log', 'SUCCESS', { message, ...options });
    return this._toast.success(message, options);
  }

  error(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    this._log('error', 'ERROR', { message, ...options });
    return this._toast.error(message, options);
  }

  warning(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    this._log('warn', 'WARNING', { message, ...options });
    return this._toast.warning(message, options);
  }

  info(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    this._log('info', 'INFO', { message, ...options });
    return this._toast.info(message, options);
  }

  loading(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    this._log('log', 'LOADING', { message, ...options });
    return this._toast.loading(message, options);
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private _log(
    method: 'log' | 'error' | 'warn' | 'info',
    type: string,
    options: Partial<ToastOptions>
  ): void {
    const label = options.title
      ? `[TOAST][${type}] ${options.title}: ${options.message}`
      : `[TOAST][${type}] ${options.message}`;

    if (options.data !== undefined && options.data !== null) {
      console[method](label, options.data);
    } else {
      console[method](label);
    }
  }
}
