# ngx-advanced-toast

> Advanced Angular toast notifications built on the native `<dialog>` element — signals-first, zero RxJS, CSS-only animations, fully accessible.

[![npm version](https://img.shields.io/npm/v/ngx-advanced-toast.svg)](https://www.npmjs.com/package/ngx-advanced-toast)
[![Angular](https://img.shields.io/badge/Angular-21%2B-red.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/bundle-~40kB-green.svg)](https://bundlephobia.com/package/ngx-advanced-toast)

---

## Features

- **Native `<dialog>` element** — non-modal, never blocks user interaction
- **Angular Signals** — fully reactive with zero RxJS dependency
- **6 toast types** — `success`, `error`, `warning`, `info`, `loading`, `default`
- **6 positions** — all four corners, top-center, bottom-center
- **Queue system** — cap visible toasts; overflow waits in queue and auto-promotes
- **Loading → success/error pattern** — live-update any toast in place
- **Action buttons** — up to `primary`, `secondary`, and `danger` styled CTAs
- **Hover-pause** — progress timer freezes while the cursor is over the toast
- **CSS custom properties** — fully themeable without touching component internals
- **Automatic dark mode** — responds to `prefers-color-scheme: dark`
- **Reduced motion** — respects `prefers-reduced-motion`
- **Responsive** — full-width on mobile (≤ 480 px)
- **Accessible** — `role="alert"` on errors, `role="status"` elsewhere, keyboard-dismissible

---

## Installation

```bash
npm install ngx-advanced-toast
```

**Peer dependencies** (already in your Angular project):

```json
"@angular/common": "^21.0.0",
"@angular/core": "^21.0.0",
"@angular/platform-browser": "^21.0.0"
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
    provideToast({
      position: 'top-right',
      duration: 4000,
    }),
  ],
};
```

### 2. Add the container to your root template

```html
<!-- app.component.html -->
<router-outlet />
<toast-container />
```

```ts
// app.component.ts
import { ToastContainerComponent } from 'ngx-advanced-toast';

@Component({
  imports: [RouterOutlet, ToastContainerComponent],
  // ...
})
export class AppComponent {}
```

### 3. Inject and use

```ts
import { Component, inject } from '@angular/core';
import { ToastService } from 'ngx-advanced-toast';

@Component({ /* ... */ })
export class MyComponent {
  private toast = inject(ToastService);

  save() {
    this.toast.success('Changes saved!');
  }
}
```

---

## Usage

### Shorthand methods

```ts
this.toast.success('Profile updated');
this.toast.error('Something went wrong');
this.toast.warning('Session expires in 5 minutes');
this.toast.info('New version available');
this.toast.loading('Uploading file…');  // persistent until you dismiss/update
```

### `show()` with full options

```ts
this.toast.show({
  type: 'success',
  title: 'Upload complete',
  message: '3 files were uploaded successfully.',
  duration: 6000,
  position: 'bottom-right',
  dismissible: true,
  showProgress: true,
});
```

### Loading → Success/Error pattern

```ts
const id = this.toast.loading('Saving changes…');

try {
  await this.api.save(data);
  this.toast.update(id, {
    type: 'success',
    message: 'Changes saved!',
    duration: 3000,
  });
} catch {
  this.toast.update(id, {
    type: 'error',
    message: 'Save failed. Please try again.',
    duration: 5000,
  });
}
```

### Action buttons

```ts
this.toast.show({
  type: 'warning',
  message: 'Unsaved changes will be lost.',
  duration: 0,              // persistent
  dismissible: false,
  actions: [
    {
      label: 'Discard',
      style: 'danger',
      callback: (id) => {
        this.router.navigate(['/dashboard']);
        this.toast.dismiss(id);
      },
    },
    {
      label: 'Keep editing',
      style: 'secondary',
      closeOnClick: true,   // default
      callback: () => {},
    },
  ],
});
```

### Dismiss API

```ts
const id = this.toast.show({ message: 'Hello' });

this.toast.dismiss(id);     // trigger leave animation
this.toast.dismissAll();    // dismiss every visible toast + clear queue
this.toast.remove(id);      // remove immediately (after animation ends internally)
```

---

## API Reference

### `ToastService` methods

| Method | Signature | Description |
|---|---|---|
| `show` | `(options: ToastOptions) => string` | Show a toast and return its ID |
| `success` | `(message, options?) => string` | Success toast |
| `error` | `(message, options?) => string` | Error toast |
| `warning` | `(message, options?) => string` | Warning toast |
| `info` | `(message, options?) => string` | Info toast |
| `loading` | `(message, options?) => string` | Persistent loading toast |
| `update` | `(id, patch: Partial<ToastOptions>) => void` | Live-patch any visible toast |
| `dismiss` | `(id) => void` | Trigger leave animation |
| `dismissAll` | `() => void` | Dismiss all visible toasts + clear queue |
| `remove` | `(id) => void` | Remove from DOM after animation |

### `ToastOptions`

| Property | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | **required** | Toast body text |
| `type` | `ToastType` | `'default'` | Visual type |
| `title` | `string` | `''` | Optional bold heading |
| `id` | `string` | auto-generated | Custom identifier |
| `duration` | `number` (ms) | `4000` | Display time; `0` = persistent |
| `position` | `ToastPosition` | `'top-right'` | Screen position |
| `dismissible` | `boolean` | `true` | Show × close button |
| `showProgress` | `boolean` | `true` | Animated countdown bar |
| `actions` | `ToastAction[]` | `[]` | Action buttons |
| `data` | `unknown` | `null` | Arbitrary payload for callbacks |

### `provideToast(config?)` — global defaults

| Property | Type | Default | Description |
|---|---|---|---|
| `position` | `ToastPosition` | `'top-right'` | Default position |
| `duration` | `number` (ms) | `4000` | Default display time |
| `maxVisible` | `number` | `5` | Max simultaneous toasts |
| `dismissible` | `boolean` | `true` | Default dismissible state |
| `showProgress` | `boolean` | `true` | Default progress bar state |
| `animationDuration` | `number` (ms) | `300` | Enter/leave animation speed |
| `gap` | `number` (px) | `12` | Gap between stacked toasts |

### `ToastAction`

| Property | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Button text |
| `callback` | `(id: string) => void` | **required** | Click handler |
| `style` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Button appearance |
| `closeOnClick` | `boolean` | `true` | Auto-dismiss toast on click |

---

## ToastLogger

`ToastLogger` is a drop-in alternative to `ToastService` that mirrors every notification to the browser console. Useful for audit trails and debugging.

Console format: `[TOAST][TYPE] Title: message`

```ts
import { inject } from '@angular/core';
import { ToastLogger } from 'ngx-advanced-toast';

@Component({ /* ... */ })
export class MyComponent {
  private logger = inject(ToastLogger);

  onError(err: unknown) {
    // Shows toast AND logs to console.error()
    this.logger.error('Request failed', { data: err });
  }
}
```

`ToastLogger` exposes the same methods as `ToastService`: `show`, `success`, `error`, `warning`, `info`, `loading`.

---

## Theming

All visual properties are CSS custom properties — override them on `:root` or any ancestor element.

### Layout & structure

| Property | Default | Description |
|---|---|---|
| `--toast-min-width` | `300px` | Minimum toast width |
| `--toast-max-width` | `480px` | Maximum toast width |
| `--toast-padding` | `14px 14px 14px 12px` | Inner padding |
| `--toast-border-radius` | `10px` | Corner radius |
| `--toast-border-width` | `1px` | Border width |
| `--toast-border-color` | `rgba(0,0,0,0.07)` | Border color |
| `--toast-shadow` | subtle drop shadow | Box shadow |
| `--toast-font-size` | `0.875rem` | Body text size |
| `--toast-icon-size` | `20px` | Icon size |
| `--toast-z-index` | `9999` | Stack order |
| `--toast-region-padding` | `16px` | Distance from viewport edges |
| `--toast-gap` | `12px` | Gap between stacked toasts |

### Colors

| Property | Default | Description |
|---|---|---|
| `--toast-bg` | `#ffffff` | Background color |
| `--toast-color` | `#111827` | Title & close button text color |
| `--toast-message-color` | `#374151` | Body text color |
| `--toast-close-color` | `#9ca3af` | Close icon color |
| `--toast-success-color` | `#16a34a` | Success accent |
| `--toast-error-color` | `#dc2626` | Error accent |
| `--toast-warning-color` | `#d97706` | Warning accent |
| `--toast-info-color` | `#2563eb` | Info accent |
| `--toast-loading-color` | `#7c3aed` | Loading accent |
| `--toast-default-color` | `#6b7280` | Default accent |

### Animation

| Property | Default | Description |
|---|---|---|
| `--toast-animation-duration` | `300ms` | Enter/leave animation duration |
| `--toast-animation-easing` | `cubic-bezier(0.34,1.56,0.64,1)` | Enter easing (spring-like) |

### Example: dark custom theme

```css
:root {
  --toast-bg: #18181b;
  --toast-color: #fafafa;
  --toast-message-color: #a1a1aa;
  --toast-border-color: rgba(255, 255, 255, 0.1);
  --toast-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  --toast-border-radius: 8px;
  --toast-success-color: #22c55e;
  --toast-error-color: #ef4444;
}
```

### Automatic dark mode

The component automatically adapts to `prefers-color-scheme: dark` with sensible dark defaults. Override via CSS custom properties to customize.

### Reduced motion

When `prefers-reduced-motion: reduce` is active, enter/leave animations are replaced with a simple opacity fade and the progress bar is hidden.

---

## TypeScript Types

```ts
import type {
  ToastType,        // 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'
  ToastPosition,    // 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  ToastActionStyle, // 'primary' | 'secondary' | 'danger'
  ToastState,       // 'entering' | 'visible' | 'leaving'
  ToastAction,
  ToastOptions,
  ToastConfig,
  Toast,
} from 'ngx-advanced-toast';
```

---

## Browser Support

Requires native `<dialog>` element support. Supported in all modern browsers (Chrome 37+, Firefox 98+, Safari 15.4+, Edge 79+).

---

## License

MIT © Hamed Kshiem
