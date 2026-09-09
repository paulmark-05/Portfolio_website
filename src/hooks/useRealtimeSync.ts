import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseEnabled } from "../lib/supabaseClient";

/**
 * Live sync (FIX 12).
 *
 * The backend here is Supabase, so the equivalent of a Socket.IO live channel
 * is Supabase Realtime — a WebSocket subscription to Postgres changes. When any
 * CMS table changes (insert/update/delete), we invalidate the cached site
 * content and React Query refetches, so the public portfolio updates with no
 * refresh. No-op when Supabase isn't configured (seed mode).
 */
const TABLES = ["profiles", "projects", "experience", "achievements", "skills", "certifications", "settings"];

export function useRealtimeSync() {
  const qc = useQueryClient();
  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;

    const refresh = () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
    };

    const channel = supabase.channel("cms-live-sync");
    for (const table of TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refresh
      );
    }
    channel.subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [qc]);
}
