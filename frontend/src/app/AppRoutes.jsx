import { Navigate, Route, Routes } from "react-router-dom";
import AuthVerifyPage from "../features/auth/AuthVerifyPage";
import HistoryPage from "../features/history/HistoryPage";
import LoginPage from "../features/auth/LoginPage";
import RecoveryPage from "../features/auth/RecoveryPage";
import RegisterPage from "../features/auth/RegisterPage";
import LandingPage from "../features/landing/LandingPage";
import ResultPage from "../features/result/ResultPage";
import WizardPage from "../features/wizard/WizardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/recovery" element={<RecoveryPage />} />
      <Route path="/auth/recovery/verify" element={<AuthVerifyPage />} />
      <Route path="/auth/verify" element={<AuthVerifyPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/wizard" element={<WizardPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
