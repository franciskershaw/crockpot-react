import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>Crockpot</h1>} />
    </Routes>
  );
}
