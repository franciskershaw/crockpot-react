import { BrowserRouter } from "react-router-dom";

import { ToastProvider } from "../components/ui/Toast";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
