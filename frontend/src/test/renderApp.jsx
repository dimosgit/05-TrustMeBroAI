import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import AppProviders from "../app/AppProviders";

export function renderApp(initialEntries = ["/"]) {
  return render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>
  );
}
