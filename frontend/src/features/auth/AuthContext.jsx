import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchAuthMe, logoutAuth } from "../../lib/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const authMutationVersionRef = useRef(0);

  const refreshAuth = useCallback(async ({ force = false } = {}) => {
    const requestVersion = authMutationVersionRef.current;
    const authUser = await fetchAuthMe();

    if (force || requestVersion === authMutationVersionRef.current) {
      setUser(authUser);
    }

    return authUser;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    refreshAuth()
      .catch(() => {
        if (!isCancelled) {
          setUser(null);
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
    async (authUser) => {
      if (authUser) {
        authMutationVersionRef.current += 1;
        setUser(authUser);
        return authUser;
      }

      return refreshAuth({ force: true });
    },
    [refreshAuth]
  );

  const logout = useCallback(async () => {
    authMutationVersionRef.current += 1;
    setUser(null);

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
      refreshAuth,
      setAuthenticatedUser,
      logout
    }),
    [user, isBootstrapping, refreshAuth, setAuthenticatedUser, logout]
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
