import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "../lib/supabaseClient";

interface AuthState {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  enabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const Ctx = createContext<AuthState>(null as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (s: Session | null) => {
    if (!s || !supabase) { setIsAdmin(false); return; }
    const { data } = await supabase.from("profiles").select("role").eq("id", s.user.id).maybeSingle();
    setIsAdmin(data?.role === "admin");
  };

  useEffect(() => {
    if (!supabaseEnabled || !supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await checkAdmin(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await checkAdmin(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };
  const signOut = async () => { await supabase?.auth.signOut(); };

  const requestPasswordReset = async (email: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    return error ? { error: error.message } : {};
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  };

  return (
    <Ctx.Provider value={{ session, isAdmin, loading, enabled: supabaseEnabled, signIn, signOut, requestPasswordReset, updatePassword }}>
      {children}
    </Ctx.Provider>
  );
}
