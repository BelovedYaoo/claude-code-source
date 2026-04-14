import { useStartupNotification } from './useStartupNotification.js';

export function useCanSwitchToExistingSubscription(): void {
  useStartupNotification(async () => null);
}
