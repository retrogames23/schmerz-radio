import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { onCloudUsage } from "@/llm/cloudLlmRuntime";

export interface DonationStatus {
  loading: boolean;
  unlocked: boolean;
  count: number;
  softLimit: number;
  hardLimit: number;
  refresh: () => Promise<void>;
}

const SOFT_LIMIT = 30;
const HARD_LIMIT = 50;

/**
 * Liest das User-Profil (donation_unlocked + cloud_request_count)
 * und hört auf Cloud-Usage-Events vom Cloud-LLM, um den Counter live
 * zu aktualisieren, ohne extra DB-Roundtrips.
 */
export function useDonationStatus(): DonationStatus {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnlocked(false);
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("donation_unlocked, cloud_request_count")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) {
      setUnlocked(!!data.donation_unlocked);
      setCount(data.cloud_request_count ?? 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Live-Updates aus dem Cloud-LLM
  useEffect(() => {
    return onCloudUsage((e) => {
      if (typeof e.count === "number") setCount(e.count);
      setUnlocked(e.unlocked);
    });
  }, []);

  // Refetch bei Tab-Focus (z. B. nach erfolgreicher Spende im neuen Tab)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [refresh]);

  return {
    loading,
    unlocked,
    count,
    softLimit: SOFT_LIMIT,
    hardLimit: HARD_LIMIT,
    refresh,
  };
}