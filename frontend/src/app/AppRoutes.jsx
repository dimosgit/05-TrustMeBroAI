import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../features/landing/LandingPage";
import ResultPage from "../features/result/ResultPage";
import WizardPage from "../features/wizard/WizardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/wizard" element={<WizardPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
