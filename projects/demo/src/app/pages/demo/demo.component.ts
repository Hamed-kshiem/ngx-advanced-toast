import { Component, inject, signal } from '@angular/core';
import { ToastService, ToastLogger, ToastPosition } from 'ngx-advanced-toast';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css',
})
export class DemoComponent {
  private readonly toast = inject(ToastService);
  private readonly logger = inject(ToastLogger);

  readonly selectedPosition = signal<ToastPosition>('top-right');
  readonly positions: ToastPosition[] = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];

  // ─── Basic Types ─────────────────────────────────────────────────────────

  showSuccess(): void {
    this.toast.success('Your changes have been saved successfully.', {
      title: 'Saved!',
      position: this.selectedPosition(),
    });
  }

  showError(): void {
    this.toast.error('Something went wrong. Please try again.', {
      title: 'Error',
      position: this.selectedPosition(),
    });
  }

  showWarning(): void {
    this.toast.warning('Your session will expire in 5 minutes.', {
      title: 'Warning',
      position: this.selectedPosition(),
    });
  }

  showInfo(): void {
    this.toast.info('A new version of the app is available.', {
      title: 'Update Available',
      position: this.selectedPosition(),
    });
  }

  showDefault(): void {
    this.toast.show({
      message: 'This is a default notification.',
      position: this.selectedPosition(),
    });
  }

  // ─── Loading → Success Pattern ────────────────────────────────────────────

  showLoadingThenSuccess(): void {
    const id = this.toast.loading('Uploading file...', {
      title: 'Uploading',
      position: this.selectedPosition(),
    });

    setTimeout(() => {
      this.toast.update(id, {
        type: 'success',
        title: 'Upload complete',
        message: 'file.pdf was uploaded successfully.',
        duration: 4000,
        showProgress: true,
      });
    }, 2500);
  }

  // ─── With Actions ─────────────────────────────────────────────────────────

  showWithActions(): void {
    this.toast.show({
      type: 'warning',
      title: 'Delete item?',
      message: 'This action cannot be undone.',
      duration: 0,
      position: this.selectedPosition(),
      actions: [
        {
          label: 'Delete',
          style: 'danger',
          callback: () => {
            this.toast.success('Item deleted.', { position: this.selectedPosition() });
          },
        },
        {
          label: 'Cancel',
          style: 'secondary',
          callback: () => {},
        },
      ],
    });
  }

  showWithPrimaryAction(): void {
    this.toast.show({
      type: 'info',
      title: 'New message',
      message: 'John sent you a message.',
      position: this.selectedPosition(),
      actions: [
        {
          label: 'View',
          style: 'primary',
          callback: () => {
            this.toast.info('Opening messages...', { position: this.selectedPosition() });
          },
        },
      ],
    });
  }

  // ─── No Progress / Persistent ─────────────────────────────────────────────

  showPersistent(): void {
    this.toast.show({
      type: 'info',
      title: 'Persistent toast',
      message: 'This toast stays until you dismiss it.',
      duration: 0,
      showProgress: false,
      position: this.selectedPosition(),
      actions: [
        {
          label: 'Dismiss',
          style: 'secondary',
          callback: () => {},
        },
      ],
    });
  }

  showNoProgress(): void {
    this.toast.success('Saved without progress bar.', {
      showProgress: false,
      position: this.selectedPosition(),
    });
  }

  // ─── Logger (also logs to console) ───────────────────────────────────────

  logSuccess(): void {
    this.logger.success('Profile updated.', {
      title: 'Logger: Success',
      position: this.selectedPosition(),
    });
  }

  logError(): void {
    this.logger.error('Network request failed with status 500.', {
      title: 'Logger: Error',
      position: this.selectedPosition(),
      data: { statusCode: 500, url: '/api/users' },
    });
  }

  // ─── Queue Overflow ────────────────────────────────────────────────────────

  spamToasts(): void {
    const types = ['success', 'error', 'warning', 'info'] as const;
    for (let i = 1; i <= 8; i++) {
      const type = types[i % types.length];
      setTimeout(() => {
        this.toast.show({
          type,
          message: `Toast #${i} — ${type}`,
          position: this.selectedPosition(),
          duration: 5000,
        });
      }, i * 150);
    }
  }

  dismissAll(): void {
    this.toast.dismissAll();
  }

  setPosition(pos: ToastPosition): void {
    this.selectedPosition.set(pos);
  }
}
