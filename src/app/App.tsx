import { BrowserRouter } from "react-router-dom";

import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../features/auth/components/AuthContext";
import TanstackQueryProvider from "../lib/Tanstack/TanstackQueryProvider";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <TanstackQueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </TanstackQueryProvider>
  );
}

export default App;
