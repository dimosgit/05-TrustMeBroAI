import { ToastProvider } from "../components/ui/ToastProvider";
import { AuthProvider } from "../features/auth/AuthContext";
import { RecommendationProvider } from "../features/result/RecommendationContext";

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <RecommendationProvider>{children}</RecommendationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
