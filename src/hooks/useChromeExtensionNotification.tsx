import { useStartupNotification } from './notifs/useStartupNotification.js';

export function useChromeExtensionNotification(): void {
  useStartupNotification(() => null);
}
