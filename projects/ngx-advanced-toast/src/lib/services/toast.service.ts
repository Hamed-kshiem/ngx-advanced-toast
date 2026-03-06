import { Injectable, inject, signal, computed } from '@angular/core';
import { TOAST_CONFIG, TOAST_DEFAULT_CONFIG } from '../tokens/toast.tokens';
import {
  Toast,
  ToastOptions,
  ToastPosition,
  ResolvedToastConfig,
} from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  // ─── Config ───────────────────────────────────────────────────────────────
  readonly config: ResolvedToastConfig =
    inject(TOAST_CONFIG, { optional: true }) ?? { ...TOAST_DEFAULT_CONFIG };

  // ─── Private Signals ──────────────────────────────────────────────────────

  /** All currently rendering toasts (entering | visible | leaving) */
  private readonly _allToasts = signal<Toast[]>([]);

  /** Toasts waiting to be shown once space opens */
  private readonly _queue = signal<Toast[]>([]);

  // ─── Public Computed ──────────────────────────────────────────────────────

  /** Filtered view: only non-gone toasts */
  readonly visibleToasts = computed<Toast[]>(() => this._allToasts());

  /**
   * Toasts grouped by position.
   * Returns Map<ToastPosition, Toast[]> for the container to iterate.
   */
  readonly toastsByPosition = computed(() => {
    const map = new Map<ToastPosition, Toast[]>();
    for (const toast of this._allToasts()) {
      const pos = toast.position;
      if (!map.has(pos)) map.set(pos, []);
      map.get(pos)!.push(toast);
    }
    return map;
  });

  /** Number of toasts waiting in queue */
  readonly queueLength = computed(() => this._queue().length);

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Show a toast and return its ID */
  show(options: ToastOptions): string {
    const id = options.id ?? this._generateId();
    const toast: Toast = {
      id,
      type: options.type ?? 'default',
      title: options.title ?? '',
      message: options.message,
      duration: options.duration ?? this.config.duration,
      position: options.position ?? this.config.position,
      dismissible: options.dismissible ?? this.config.dismissible,
      showProgress: options.showProgress ?? this.config.showProgress,
      actions: options.actions ?? [],
      data: options.data ?? null,
      createdAt: Date.now(),
      state: 'entering',
    };

    const activeCount = this._activeCount();

    if (activeCount >= this.config.maxVisible) {
      this._queue.update(q => [...q, toast]);
    } else {
      this._allToasts.update(all => [...all, toast]);
    }

    return id;
  }

  success(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    return this.show({ ...options, message, type: 'success' });
  }

  error(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    return this.show({ ...options, message, type: 'error' });
  }

  warning(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    return this.show({ ...options, message, type: 'warning' });
  }

  info(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    return this.show({ ...options, message, type: 'info' });
  }

  /**
   * Show a persistent loading toast. Call `update(id, { type: 'success', message: '...' })`
   * when the operation completes.
   */
  loading(message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>): string {
    return this.show({ ...options, message, type: 'loading', duration: 0 });
  }

  /** Trigger the leave animation. Component calls `remove()` when animation ends. */
  dismiss(id: string): void {
    this._updateState(id, 'leaving');
  }

  /** Dismiss all visible toasts and clear the queue. */
  dismissAll(): void {
    this._queue.set([]);
    const ids = this._allToasts()
      .filter(t => t.state === 'entering' || t.state === 'visible')
      .map(t => t.id);
    ids.forEach(id => this._updateState(id, 'leaving'));
  }

  /**
   * Remove a toast from the DOM list after leave animation ends.
   * This triggers the queue flush.
   */
  remove(id: string): void {
    this._allToasts.update(all => all.filter(t => t.id !== id));
    this._flushQueue();
  }

  /** Called by ToastComponent after the enter animation completes. */
  markVisible(id: string): void {
    this._updateState(id, 'visible');
  }

  /**
   * Mutate a toast in-place — ideal for loading → success patterns.
   * Ignores updates on toasts in 'leaving' state.
   */
  update(id: string, patch: Partial<ToastOptions>): void {
    this._allToasts.update(all =>
      all.map(t => {
        if (t.id !== id || t.state === 'leaving') return t;
        return {
          ...t,
          ...(patch.type !== undefined ? { type: patch.type } : {}),
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.message !== undefined ? { message: patch.message } : {}),
          ...(patch.duration !== undefined ? { duration: patch.duration } : {}),
          ...(patch.position !== undefined ? { position: patch.position } : {}),
          ...(patch.dismissible !== undefined ? { dismissible: patch.dismissible } : {}),
          ...(patch.showProgress !== undefined ? { showProgress: patch.showProgress } : {}),
          ...(patch.actions !== undefined ? { actions: patch.actions } : {}),
          ...(patch.data !== undefined ? { data: patch.data } : {}),
        };
      })
    );
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private _generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private _updateState(id: string, state: Toast['state']): void {
    this._allToasts.update(all =>
      all.map(t => (t.id === id ? { ...t, state } : t))
    );
  }

  private _activeCount(): number {
    return this._allToasts().filter(
      t => t.state === 'entering' || t.state === 'visible'
    ).length;
  }

  private _flushQueue(): void {
    const active = this._activeCount();
    const available = this.config.maxVisible - active;
    if (available <= 0) return;

    const queue = this._queue();
    if (queue.length === 0) return;

    const toPromote = queue.slice(0, available);
    const remaining = queue.slice(available);

    this._queue.set(remaining);
    this._allToasts.update(all => [...all, ...toPromote]);
  }
}
