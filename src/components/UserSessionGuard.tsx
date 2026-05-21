import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthenticatedUserById } from "../api/usersService.ts";
import {
  clearToken,
  getCurrentUserId,
  isAuthenticated,
  LOGIN_NOTICE_KEY,
  SUSPENDED_SESSION_MESSAGE,
} from "../utils/auth.ts";
import { POLL_INTERVAL_MS } from "../utils/polling.ts";

/**
 * Vigila solo la sesión del usuario actual (token en este navegador).
 * Si ese usuario queda suspendido, cierra su sesión local; no afecta a otros.
 */
export default function UserSessionGuard() {
  const navigate = useNavigate();
  const loggingOutRef = useRef(false);

  const logoutIfCurrentUserSuspended = useCallback(async () => {
    if (!isAuthenticated() || loggingOutRef.current) return;

    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      const profile = await getAuthenticatedUserById(userId);
      if (profile.id !== userId) return;
      if (!profile.isSuspended) return;

      loggingOutRef.current = true;
      clearToken();
      sessionStorage.setItem(LOGIN_NOTICE_KEY, SUSPENDED_SESSION_MESSAGE);
      navigate("/login", {
        replace: true,
        state: { notice: SUSPENDED_SESSION_MESSAGE },
      });
    } catch {
      // No cerrar sesión por errores de red; solo si confirmamos suspensión del usuario actual
    }
  }, [navigate]);

  useEffect(() => {
    loggingOutRef.current = false;
    void logoutIfCurrentUserSuspended();
  }, [logoutIfCurrentUserSuspended]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const intervalId = window.setInterval(() => {
      void logoutIfCurrentUserSuspended();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [logoutIfCurrentUserSuspended]);

  return null;
}
