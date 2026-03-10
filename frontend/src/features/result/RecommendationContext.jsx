import { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "trustmebro.recommendation";
const RecommendationContext = createContext(null);

function readStoredRecommendation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const serialized = window.sessionStorage.getItem(STORAGE_KEY);
    return serialized ? JSON.parse(serialized) : null;
  } catch {
    return null;
  }
}

function writeStoredRecommendation(value) {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function RecommendationProvider({ children }) {
  const [resultState, setResultState] = useState(() => readStoredRecommendation());

  const setLockedResult = useCallback((value) => {
    setResultState(value);
    writeStoredRecommendation(value);
  }, []);

  const setUnlockedResult = useCallback((value) => {
    setResultState(value);
    writeStoredRecommendation(value);
  }, []);

  const clearResult = useCallback(() => {
    setResultState(null);
    writeStoredRecommendation(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      resultState,
      setLockedResult,
      setUnlockedResult,
      clearResult
    }),
    [resultState, setLockedResult, setUnlockedResult, clearResult]
  );

  return <RecommendationContext.Provider value={contextValue}>{children}</RecommendationContext.Provider>;
}

export function useRecommendation() {
  const context = useContext(RecommendationContext);

  if (!context) {
    throw new Error("useRecommendation must be used within RecommendationProvider");
  }

  return context;
}
