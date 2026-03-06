import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { TOAST_CONFIG, TOAST_DEFAULT_CONFIG } from '../../tokens/toast.tokens';
import { ToastPosition } from '../../models/toast.model';
import { ToastComponent } from '../toast/toast.component';

/** All possible positions to render regions for */
const ALL_POSITIONS: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

@Component({
  selector: 'ngx-toast-container',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);
  readonly config = inject(TOAST_CONFIG, { optional: true }) ?? { ...TOAST_DEFAULT_CONFIG };

  /**
   * Only render region divs for positions that have active toasts.
   * This avoids rendering empty fixed-position containers.
   */
  readonly activeRegions = computed(() => {
    const map = this.service.toastsByPosition();
    return ALL_POSITIONS
      .filter(pos => (map.get(pos)?.length ?? 0) > 0)
      .map(pos => ({ position: pos, toasts: map.get(pos)! }));
  });

  onDismiss(id: string): void {
    const toast = this.service.visibleToasts().find(t => t.id === id);
    if (!toast || toast.state === 'leaving') return;
    this.service.dismiss(id);

    // Remove from DOM after the leave animation completes
    setTimeout(() => this.service.remove(id), this.config.animationDuration + 50);
  }

  onVisible(id: string): void {
    this.service.markVisible(id);
  }
}
