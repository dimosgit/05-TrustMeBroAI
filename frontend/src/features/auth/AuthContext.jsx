import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchAuthMe, logoutAuth } from "../../lib/api/authApi";

const AuthContext = createContext(null);
const PASSKEY_ENROLLMENT_NUDGE_KEY = "trustmebro.passkey_enrollment_required";

function readStoredPasskeyEnrollmentNudge() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PASSKEY_ENROLLMENT_NUDGE_KEY) === "1";
}

function writeStoredPasskeyEnrollmentNudge(value) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.sessionStorage.setItem(PASSKEY_ENROLLMENT_NUDGE_KEY, "1");
    return;
  }

  window.sessionStorage.removeItem(PASSKEY_ENROLLMENT_NUDGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [requiresPasskeyEnrollment, setRequiresPasskeyEnrollment] = useState(() =>
    readStoredPasskeyEnrollmentNudge()
  );
  const authMutationVersionRef = useRef(0);

  const refreshAuth = useCallback(async ({ force = false } = {}) => {
    const requestVersion = authMutationVersionRef.current;
    const authUser = await fetchAuthMe();

    if (force || requestVersion === authMutationVersionRef.current) {
      setUser(authUser);
      if (authUser?.id) {
        setRequiresPasskeyEnrollment(readStoredPasskeyEnrollmentNudge());
      } else {
        setRequiresPasskeyEnrollment(false);
        writeStoredPasskeyEnrollmentNudge(false);
      }
    }

    return authUser;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    refreshAuth()
      .catch(() => {
        if (!isCancelled) {
          setUser(null);
          setRequiresPasskeyEnrollment(false);
          writeStoredPasskeyEnrollmentNudge(false);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [refreshAuth]);

  const setAuthenticatedUser = useCallback(
    async (authUser, { requiresPasskeyEnrollment: nextRequiresPasskeyEnrollment = false } = {}) => {
      if (authUser) {
        authMutationVersionRef.current += 1;
        setUser(authUser);
        setRequiresPasskeyEnrollment(Boolean(nextRequiresPasskeyEnrollment));
        writeStoredPasskeyEnrollmentNudge(Boolean(nextRequiresPasskeyEnrollment));
        return authUser;
      }

      return refreshAuth({ force: true });
    },
    [refreshAuth]
  );

  const dismissPasskeyEnrollmentNudge = useCallback(() => {
    setRequiresPasskeyEnrollment(false);
    writeStoredPasskeyEnrollmentNudge(false);
  }, []);

  const logout = useCallback(async () => {
    authMutationVersionRef.current += 1;
    setUser(null);
    setRequiresPasskeyEnrollment(false);
    writeStoredPasskeyEnrollmentNudge(false);

    try {
      await logoutAuth();
    } catch {
      // Keep UX deterministic: local logout must not depend on backend availability.
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isBootstrapping,
      isAuthenticated: Boolean(user?.id),
      requiresPasskeyEnrollment,
      refreshAuth,
      setAuthenticatedUser,
      dismissPasskeyEnrollmentNudge,
      logout
    }),
    [
      user,
      isBootstrapping,
      requiresPasskeyEnrollment,
      refreshAuth,
      setAuthenticatedUser,
      dismissPasskeyEnrollmentNudge,
      logout
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
