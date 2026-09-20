import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./AdminLayout";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Sections from "./pages/Sections";
import Profile from "./pages/Profile";
import Highlights from "./pages/Highlights";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import Achievements from "./pages/Achievements";
import Skills from "./pages/Skills";
import Certifications from "./pages/Certifications";
import Contact from "./pages/Contact";
import Seo from "./pages/Seo";
import MediaLibrary from "./pages/MediaLibrary";

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="sections" replace />} />
            <Route path="sections" element={<Sections />} />
            <Route path="profile" element={<Profile />} />
            <Route path="highlights" element={<Highlights />} />
            <Route path="projects" element={<Projects />} />
            <Route path="experience" element={<Experience />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="skills" element={<Skills />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="contact" element={<Contact />} />
            <Route path="seo" element={<Seo />} />
            <Route path="media" element={<MediaLibrary />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
