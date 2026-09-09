import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading, enabled } = useAuth();
  if (!enabled)
    return <div className="admin-empty">Supabase isn't configured. Add <code>.env.local</code> with your project URL + anon key to use the CMS.</div>;
  if (loading) return <div className="admin-empty">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div className="admin-empty">Your account isn't an admin. Ask an admin to set <code>role='admin'</code> on your profile.</div>;
  return <>{children}</>;
}
