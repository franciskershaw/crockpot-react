import { BrowserRouter } from "react-router-dom";

import { ErrorBoundary } from "../components/app/ErrorBoundary";
import { ScrollToTop } from "../components/app/ScrollToTop";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../features/auth/components/AuthContext";
import TanstackQueryProvider from "../lib/tanstack/TanstackQueryProvider";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <TanstackQueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
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
