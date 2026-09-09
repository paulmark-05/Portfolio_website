import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, requestPasswordReset, session, enabled } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) { nav("/admin", { replace: true }); }

  const submit = async () => {
    setBusy(true); setErr("");
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErr(error); else nav("/admin", { replace: true });
  };

  const submitReset = async () => {
    setBusy(true); setErr(""); setNotice("");
    const { error } = await requestPasswordReset(email);
    setBusy(false);
    if (error) setErr(error);
    else setNotice(`If an account exists for ${email}, a password-reset link is on its way — check your inbox (and spam folder).`);
  };

  return (
    <div className="admin-login">
      <div className="admin-card">
        <h1 className="sec-title" style={{ fontSize: 26 }}>Portfolio CMS</h1>
        <p style={{ color: "var(--muted)", marginBottom: 22 }}>
          {mode === "login" ? "Sign in to manage content." : "Enter your email to reset your password."}
        </p>
        {!enabled && <p className="admin-error">Supabase not configured — add your env vars.</p>}

        <label className="admin-field"><span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                 onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? submit() : submitReset())} />
        </label>

        {mode === "login" && (
          <label className="admin-field"><span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                   autoComplete="current-password" onKeyDown={(e) => e.key === "Enter" && submit()} />
          </label>
        )}

        {err && <p className="admin-error">{err}</p>}
        {notice && <p className="admin-hint" style={{ color: "var(--accent)" }}>{notice}</p>}

        {mode === "login" ? (
          <>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={busy || !enabled} onClick={submit}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}
                    onClick={() => { setMode("forgot"); setErr(""); setNotice(""); }}>
              Forgot password?
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={busy || !enabled} onClick={submitReset}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }}
                    onClick={() => { setMode("login"); setErr(""); setNotice(""); }}>
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
