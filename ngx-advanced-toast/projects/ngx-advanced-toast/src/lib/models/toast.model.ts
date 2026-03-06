// ─── Toast Type ───────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default';

// ─── Toast Position ───────────────────────────────────────────────────────────
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// ─── Action Button Style ──────────────────────────────────────────────────────
export type ToastActionStyle = 'primary' | 'secondary' | 'danger';

// ─── Toast Lifecycle State ────────────────────────────────────────────────────
export type ToastState = 'entering' | 'visible' | 'leaving';

// ─── Action Button Definition ────────────────────────────────────────────────
export interface ToastAction {
  label: string;
  style?: ToastActionStyle;
  callback: (toastId: string) => void;
  closeOnClick?: boolean; // default: true
}

// ─── Per-toast Options (public API) ──────────────────────────────────────────
export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;       // ms; 0 = persistent; default: 4000
  position?: ToastPosition;
  dismissible?: boolean;
  showProgress?: boolean;
  actions?: ToastAction[];
  data?: unknown;
}

// ─── Internal Toast (fully resolved, no optionals) ───────────────────────────
export interface Toast extends Required<Omit<ToastOptions, 'id' | 'data'>> {
  id: string;
  data: unknown;
  createdAt: number;
  state: ToastState;
}

// ─── Global Configuration ─────────────────────────────────────────────────────
export interface ToastConfig {
  position?: ToastPosition;
  duration?: number;
  maxVisible?: number;
  dismissible?: boolean;
  showProgress?: boolean;
  animationDuration?: number; // ms
  gap?: number;               // px
}

export type ResolvedToastConfig = Required<ToastConfig>;
