import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

/**
 * AuthGuard — intercepts protected actions for unauthenticated users.
 * Usage:
 *   const { guardAction, AuthLoginModal } = useAuthGuard();
 *   guardAction(() => addToCart(item));   // shows modal if not logged in, then replays action
 */
export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const guardAction = useCallback((action) => {
    if (isAuthenticated()) {
      action();
    } else {
      setPendingAction(() => action);
      setVisible(true);
    }
  }, [isAuthenticated]);

  const onLoginSuccess = useCallback(() => {
    setVisible(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const onDismiss = useCallback(() => {
    setVisible(false);
    setPendingAction(null);
  }, []);

  return { guardAction, authModalProps: { visible, onLoginSuccess, onDismiss } };
}
