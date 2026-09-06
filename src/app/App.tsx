import { BrowserRouter } from "react-router-dom";

import { ErrorBoundary } from "../components/ErrorBoundary";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../features/auth/components/AuthContext";
import TanstackQueryProvider from "../lib/Tanstack/TanstackQueryProvider";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <TanstackQueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </TanstackQueryProvider>
  );
}

export default App;
