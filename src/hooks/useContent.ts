import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent } from "../lib/queries";
import { SEED } from "../lib/content";

export function useContent() {
  const q = useQuery({
    queryKey: ["site-content"],
    queryFn: fetchSiteContent,
    staleTime: 60_000,
  });
  // Always return usable content (seed until/if Supabase resolves).
  return { content: q.data ?? SEED, isLoading: q.isLoading, error: q.error };
}
