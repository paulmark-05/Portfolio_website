import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseEnabled } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

/** Landed on from the "reset your password" email link. Supabase parses the
 *  recovery token out of the URL itself and opens a short-lived session —
 *  we just wait for that, then let the user set a new password. */
export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    setErr("");
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirm) return setErr("Passwords don't match.");
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) setErr(error);
    else { setDone(true); setTimeout(() => nav("/admin", { replace: true }), 1500); }
  };

  return (
    <div className="admin-login">
      <div className="admin-card">
        <h1 className="sec-title" style={{ fontSize: 26 }}>Set a new password</h1>
        {!supabaseEnabled && <p className="admin-error">Supabase not configured — add your env vars.</p>}
        {done ? (
          <p className="admin-hint" style={{ color: "var(--accent)" }}>Password updated — signing you in…</p>
        ) : !ready ? (
          <p className="admin-hint">Opening your reset link…</p>
        ) : (
          <>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>Choose a new password for your admin account.</p>
            <label className="admin-field"><span>New password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </label>
            <label className="admin-field"><span>Confirm password</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password"
                     onKeyDown={(e) => e.key === "Enter" && submit()} />
            </label>
            {err && <p className="admin-error">{err}</p>}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={busy} onClick={submit}>
              {busy ? "Saving…" : "Save new password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
