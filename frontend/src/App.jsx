import AppRoutes from "./app/AppRoutes";
import AppShell from "./app/layout/AppShell";

export default function App() {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}
