import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastKind = "success" | "error" | "info";
interface Toast { id: number; kind: ToastKind; message: string; }

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
  /** Wrap an async op: shows a loader overlay with `loadingMsg`, then a success/error toast. */
  run: <T>(fn: () => Promise<T>, opts?: { loading?: string; success?: string; error?: string }) => Promise<T | undefined>;
  loading: string | null;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used within ToastProvider");
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const run = useCallback(async <T,>(fn: () => Promise<T>, opts?: { loading?: string; success?: string; error?: string }) => {
    setLoading(opts?.loading ?? "Working…");
    try {
      const result = await fn();
      setLoading(null);
      toast(opts?.success ?? "Saved", "success");
      return result;
    } catch (e: any) {
      setLoading(null);
      toast(opts?.error ?? (e?.message ? `Failed: ${e.message}` : "Something went wrong"), "error");
      return undefined;
    }
  }, [toast]);

  return (
    <Ctx.Provider value={{ toast, run, loading }}>
      {children}
      {/* loader overlay */}
      {loading && (
        <div className="loader-overlay" role="status" aria-live="polite">
          <div className="loader-box">
            <span className="loader-spinner" />
            <span className="loader-msg">{loading}</span>
          </div>
        </div>
      )}
      {/* toast stack */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} role="alert">
            <span className="toast-ic">{t.kind === "success" ? "✓" : t.kind === "error" ? "✕" : "•"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
