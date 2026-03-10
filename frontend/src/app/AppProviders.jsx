import { ToastProvider } from "../components/ui/ToastProvider";
import { RecommendationProvider } from "../features/result/RecommendationContext";

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <RecommendationProvider>{children}</RecommendationProvider>
    </ToastProvider>
  );
}
