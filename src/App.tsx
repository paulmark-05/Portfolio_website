import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import ProjectArchive from "./pages/ProjectArchive";
import NotFound from "./pages/NotFound";
import AdminApp from "./admin/AdminApp";

const qc = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectArchive />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
