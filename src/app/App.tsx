import { BrowserRouter } from "react-router-dom";

import { Toaster } from "../components/ui/sonner";
import { AppRoutes } from "./AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
