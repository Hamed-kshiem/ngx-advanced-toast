# ngx-advanced-toast

> Advanced Angular 21 toast notifications built on the native `<dialog>` element.

[![npm version](https://img.shields.io/npm/v/ngx-advanced-toast.svg)](https://www.npmjs.com/package/ngx-advanced-toast)
[![Angular](https://img.shields.io/badge/Angular-21-red)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Features

- **Native `<dialog>` element** — uses `dialog.show()` (non-modal) for semantic, accessible toasts
- **Angular 21 Signals** — fully reactive with `signal()` / `computed()`, zero RxJS
- **CSS-only animations** — no `@angular/animations` dependency; respects `prefers-reduced-motion`
- **6 positions** — `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`
- **Toast types** — `success`, `error`, `warning`, `info`, `loading`, `default` — each with SVG icon
- **Progress bar** — animated countdown, pauses on hover
- **Auto-dismiss** — configurable duration per toast; `duration: 0` for persistent toasts
- **Action buttons** — `primary`, `secondary`, `danger` styles with callback
- **Queue system** — configurable max visible; overflow toasts queue and auto-promote
- **`update()` API** — mutate a live toast (loading → success pattern)
- **ToastLogger** — wraps the service and mirrors every call to the browser console
- **CSS custom properties** — theme every aspect without touching library code
- **Fully accessible** — ARIA live regions, `role="alert"` for errors, keyboard dismissible
- **Dark mode** — built-in `@media (prefers-color-scheme: dark)` support
- **Mobile responsive** — full-width toasts on small screens

---

## Installation

```bash
npm install ngx-advanced-toast
```

**Peer dependencies** (already present in Angular projects):
```
@angular/core ^21.0.0
@angular/common ^21.0.0
@angular/platform-browser ^21.0.0
```

---

## Quick Start

### 1. Register the provider

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideToast } from 'ngx-advanced-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideToast() // uses defaults
  ]
};
```

### 2. Add the container to your root component

```html
<!-- app.component.html -->
<ngx-toast-container />

<router-outlet />
```

```ts
// app.component.ts
import { ToastContainerComponent } from 'ngx-advanced-toast';

@Component({
  imports: [ToastContainerComponent, RouterOutlet],
  // ...
})
export class AppComponent {}
```

### 3. Inject and use

```ts
import { Component, inject } from '@angular/core';
import { ToastService } from 'ngx-advanced-toast';

@Component({ ... })
export class MyComponent {
  private toast = inject(ToastService);

  save() {
    this.toast.success('Changes saved!');
  }

  delete() {
    this.toast.error('Failed to delete item.', { title: 'Error' });
  }
}
```

---

## Configuration

### Global configuration via `provideToast()`

```ts
provideToast({
  position: 'top-right',    // default toast position
  duration: 4000,           // ms; 0 = persistent
  maxVisible: 5,            // max toasts shown at once; rest queue
  dismissible: true,        // show close button
  showProgress: true,       // show countdown progress bar
  animationDuration: 300,   // enter/leave animation duration in ms
  gap: 12,                  // px gap between stacked toasts
})
```

### Per-toast override

Every `show()` call accepts an options object that overrides the global config:

```ts
toast.success('Done!', {
  title: 'Upload complete',
  duration: 6000,
  position: 'bottom-center',
  showProgress: false,
  dismissible: false,
});
```

---

## API Reference

### `ToastService`

```ts
const toast = inject(ToastService);
```

| Method | Signature | Description |
|---|---|---|
| `show` | `(options: ToastOptions) => string` | Show a toast; returns its ID |
| `success` | `(message, options?) => string` | Show a success toast |
| `error` | `(message, options?) => string` | Show an error toast |
| `warning` | `(message, options?) => string` | Show a warning toast |
| `info` | `(message, options?) => string` | Show an info toast |
| `loading` | `(message, options?) => string` | Show a persistent loading toast |
| `dismiss` | `(id: string) => void` | Trigger the leave animation for a toast |
| `dismissAll` | `() => void` | Dismiss all visible toasts and clear the queue |
| `remove` | `(id: string) => void` | Immediately remove a toast (no animation) |
| `update` | `(id: string, patch: Partial<ToastOptions>) => void` | Mutate a live toast |

### `ToastLogger`

Wraps `ToastService` and also logs every notification to the browser console.

```ts
const logger = inject(ToastLogger);

logger.success('Saved!');         // toast + console.log
logger.error('Failed', opts);    // toast + console.error
logger.warning('Expiring', opts); // toast + console.warn
logger.info('Update ready', opts); // toast + console.info
logger.loading('Processing...');  // toast + console.log
```

Console output format:
```
[TOAST][SUCCESS] Title: message
[TOAST][ERROR] message  {statusCode: 500}
```

### `ToastOptions` interface

```ts
interface ToastOptions {
  id?: string;               // auto-generated if omitted
  type?: ToastType;          // 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'
  title?: string;            // optional title (bold)
  message: string;           // main message text
  duration?: number;         // ms; 0 = persistent
  position?: ToastPosition;  // per-toast position override
  dismissible?: boolean;     // show close button
  showProgress?: boolean;    // show countdown bar
  actions?: ToastAction[];   // action buttons
  data?: unknown;            // arbitrary payload (accessible via toast signal)
}
```

### `ToastAction` interface

```ts
interface ToastAction {
  label: string;
  style?: 'primary' | 'secondary' | 'danger'; // default: 'primary'
  callback: (toastId: string) => void;
  closeOnClick?: boolean; // default: true
}
```

---

## Patterns

### Loading → Success

```ts
const id = toast.loading('Uploading file...');

try {
  await uploadFile(file);
  toast.update(id, {
    type: 'success',
    message: `${file.name} uploaded successfully.`,
    duration: 4000,
    showProgress: true,
  });
} catch {
  toast.update(id, {
    type: 'error',
    message: 'Upload failed. Please try again.',
    duration: 0,
  });
}
```

### Confirmation toast with actions

```ts
toast.show({
  type: 'warning',
  title: 'Delete workspace?',
  message: 'All projects inside will be permanently removed.',
  duration: 0,
  actions: [
    {
      label: 'Delete',
      style: 'danger',
      callback: (id) => {
        deleteWorkspace();
        toast.success('Workspace deleted.');
      },
    },
    {
      label: 'Cancel',
      style: 'secondary',
      callback: () => {},
    },
  ],
});
```

### Programmatic dismiss

```ts
const id = toast.info('Connecting to server...', { duration: 0 });

await connect();
toast.dismiss(id);
```

### Dismiss all on route change

```ts
import { Router } from '@angular/router';
import { ToastService } from 'ngx-advanced-toast';
import { effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({ ... })
export class AppComponent {
  private toast = inject(ToastService);
  private router = inject(Router);

  constructor() {
    const navEvents = toSignal(this.router.events);
    effect(() => {
      const event = navEvents();
      if (event instanceof NavigationStart) {
        this.toast.dismissAll();
      }
    });
  }
}
```

---

## Theming with CSS Custom Properties

Override any of these at `:root` (global theme) or on a specific element:

```css
:root {
  /* Layout */
  --toast-z-index: 9999;
  --toast-region-padding: 16px;
  --toast-min-width: 300px;
  --toast-max-width: 480px;

  /* Appearance */
  --toast-bg: #ffffff;
  --toast-color: #111827;
  --toast-border-radius: 10px;
  --toast-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  --toast-border-width: 1px;
  --toast-border-color: rgba(0, 0, 0, 0.08);
  --toast-padding: 14px 14px 14px 12px;
  --toast-font-size: 0.875rem;
  --toast-icon-size: 20px;

  /* Type accent colors */
  --toast-success-color: #16a34a;
  --toast-error-color: #dc2626;
  --toast-warning-color: #d97706;
  --toast-info-color: #2563eb;
  --toast-loading-color: #7c3aed;
  --toast-default-color: #6b7280;

  /* Animation */
  --toast-animation-duration: 300ms;
  --toast-animation-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Dark theme example

```css
[data-theme="dark"] {
  --toast-bg: #1f2937;
  --toast-color: #f9fafb;
  --toast-border-color: rgba(255, 255, 255, 0.08);
  --toast-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}
```

---

## Accessibility

- Each toast region has `role="log"` and `aria-live="polite"` (error toasts use `aria-live="assertive"`)
- Individual toasts carry `role="status"` (or `role="alert"` for errors)
- Close button has `aria-label="Close notification"`
- Icons have `aria-hidden="true"` — text content carries the meaning
- Progress bar is decorative and hidden from screen readers
- Reduced-motion: animations replaced with a simple opacity transition when `prefers-reduced-motion: reduce` is set

---

## Component Selector Reference

| Selector | Description |
|---|---|
| `<ngx-toast-container />` | Add once to your root component template |

Do **not** add `<toast-item>` directly — it is an internal component managed by the container.

---

## Browser Support

All browsers that support the `<dialog>` element (Chrome 37+, Firefox 98+, Safari 15.4+, Edge 79+). The `dialog.show()` API used here (non-modal) has even broader support.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE)
