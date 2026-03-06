import {
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  inject,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Toast, ToastAction } from '../../models/toast.model';
import { TOAST_CONFIG, TOAST_DEFAULT_CONFIG } from '../../tokens/toast.tokens';
import { TOAST_ICONS } from './toast-icons';

@Component({
  selector: 'toast-item',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements AfterViewInit, OnDestroy {
  // ─── Inputs / Outputs ────────────────────────────────────────────────────
  readonly toast = input.required<Toast>();
  readonly dismissed = output<string>();
  readonly visibleNow = output<string>();

  // ─── DOM Ref ──────────────────────────────────────────────────────────────
  @ViewChild('dialogRef') dialogRef!: ElementRef<HTMLDialogElement>;

  // ─── Dependencies ─────────────────────────────────────────────────────────
  private readonly sanitizer = inject(DomSanitizer);
  private readonly config = inject(TOAST_CONFIG, { optional: true }) ?? { ...TOAST_DEFAULT_CONFIG };

  // ─── Timer Handles ────────────────────────────────────────────────────────
  private _enterTimer: ReturnType<typeof setTimeout> | null = null;
  private _dismissTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Paused State (hover) ────────────────────────────────────────────────
  readonly isPaused = signal(false);
  private _remainingMs = 0;
  private _pausedAt = 0;

  // ─── Computed ─────────────────────────────────────────────────────────────
  readonly iconHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(TOAST_ICONS[this.toast().type])
  );

  readonly ariaRole = computed(() =>
    this.toast().type === 'error' ? 'alert' : 'status'
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    const dialog = this.dialogRef.nativeElement;
    dialog.show(); // NON-MODAL — toasts never block interaction

    // After enter animation → mark visible
    this._enterTimer = setTimeout(() => {
      this.visibleNow.emit(this.toast().id);
      this._startDismissTimer();
    }, this.config.animationDuration);
  }

  ngOnDestroy(): void {
    this._clearTimers();
  }

  // ─── Public Methods ───────────────────────────────────────────────────────

  onDismiss(): void {
    this._clearTimers();
    this.dismissed.emit(this.toast().id);
  }

  onAction(action: ToastAction): void {
    action.callback(this.toast().id);
    if (action.closeOnClick !== false) {
      this.onDismiss();
    }
  }

  onMouseEnter(): void {
    const t = this.toast();
    if (t.duration === 0 || t.state !== 'visible') return;
    this.isPaused.set(true);
    this._pausedAt = Date.now();
    if (this._dismissTimer !== null) {
      clearTimeout(this._dismissTimer);
      this._dismissTimer = null;
    }
  }

  onMouseLeave(): void {
    const t = this.toast();
    if (t.duration === 0 || !this.isPaused()) return;
    this.isPaused.set(false);
    const elapsed = Date.now() - this._pausedAt;
    this._remainingMs = Math.max(0, this._remainingMs - elapsed);
    if (this._remainingMs > 0) {
      this._dismissTimer = setTimeout(() => this.onDismiss(), this._remainingMs);
    } else {
      this.onDismiss();
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private _startDismissTimer(): void {
    const duration = this.toast().duration;
    if (duration === 0) return; // persistent
    this._remainingMs = duration;
    this._dismissTimer = setTimeout(() => this.onDismiss(), duration);
  }

  private _clearTimers(): void {
    if (this._enterTimer !== null) {
      clearTimeout(this._enterTimer);
      this._enterTimer = null;
    }
    if (this._dismissTimer !== null) {
      clearTimeout(this._dismissTimer);
      this._dismissTimer = null;
    }
  }
}
