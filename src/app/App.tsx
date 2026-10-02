import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ErrorBoundary } from "../components/app/ErrorBoundary";
import { ScrollToTop } from "../components/app/ScrollToTop";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../features/auth/components/AuthContext";
import TanstackQueryProvider from "../lib/tanstack/TanstackQueryProvider";
import { AppRoutes } from "./AppRoutes";

function RouterRoot() {
  return (
    <>
      <ScrollToTop />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <Toaster />
    </>
  );
}

// A data router only so useBlocker works; routing itself stays in AppRoutes' <Routes>.
const router = createBrowserRouter([{ path: "*", element: <RouterRoot /> }]);

function App() {
  return (
    <TanstackQueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TanstackQueryProvider>
  );
}

export default App;
