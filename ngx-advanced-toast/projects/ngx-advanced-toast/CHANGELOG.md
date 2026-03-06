# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-06

### Added

- Initial release
- `ToastService` with signals-based state management (`signal()` / `computed()`, zero RxJS)
- Native `<dialog>.show()` non-modal implementation — toasts never block user interaction
- Toast types: `success`, `error`, `warning`, `info`, `loading`, `default` — each with inline SVG icon
- 6 position regions: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`
- CSS-only animations with direction-aware enter transitions based on `data-position`
- Progress bar with CSS `animation` — pauses on hover via mouse event tracking
- Auto-dismiss timer with hover-pause / resume support
- Queue system — `maxVisible` cap with FIFO promotion as toasts dismiss
- Action buttons — `primary`, `secondary`, `danger` styles with `closeOnClick` option
- `update(id, patch)` API — in-place toast mutation for loading → success patterns
- `dismissAll()` — clears queue and triggers leave animation on all visible toasts
- `ToastLogger` service — wraps `ToastService` and mirrors every call to the browser console
- `provideToast(config?)` environment provider — tree-shakable, `makeEnvironmentProviders`
- `TOAST_CONFIG` injection token with exported defaults (`TOAST_DEFAULT_CONFIG`)
- `ToastContainerComponent` — standalone, renders only active position regions
- Comprehensive CSS custom properties for theming (20+ variables)
- Built-in dark mode via `@media (prefers-color-scheme: dark)`
- `@media (prefers-reduced-motion: reduce)` support
- Mobile responsive: full-width toasts on screens ≤ 480px
- Full ARIA support: `role="log"`, `aria-live="polite"/"assertive"`, `role="alert"/"status"`
- Partial Ivy compilation for forward compatibility
- `sideEffects: false` for tree-shaking
