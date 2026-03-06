import { InjectionToken } from '@angular/core';
import { ResolvedToastConfig } from '../models/toast.model';

export const TOAST_DEFAULT_CONFIG: ResolvedToastConfig = {
  position: 'top-right',
  duration: 4000,
  maxVisible: 5,
  dismissible: true,
  showProgress: true,
  animationDuration: 300,
  gap: 12,
};

export const TOAST_CONFIG = new InjectionToken<ResolvedToastConfig>('TOAST_CONFIG');
