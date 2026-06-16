import { createClient } from "@supabase/supabase-js";
import { seedMedications } from "../data/seedMedications";
import type { Medication } from "../types/medication";

const STORAGE_KEY = "pedcalc:medications:v1";
const LAST_SYNC_KEY = "pedcalc:last-sync:v1";

export type MedicationLoadResult = {
  medications: Medication[];
  source: "supabase" | "local" | "seed";
  lastSync: string | null;
};

export async function loadMedications(): Promise<MedicationLoadResult> {
  const cached = readCachedMedications();
  const remote = await tryLoadFromSupabase();

  if (remote.length > 0) {
    const syncedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
    localStorage.setItem(LAST_SYNC_KEY, syncedAt);
    return { medications: remote, source: "supabase", lastSync: syncedAt };
  }

  if (cached.length > 0) {
    return {
      medications: cached,
      source: "local",
      lastSync: localStorage.getItem(LAST_SYNC_KEY)
    };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedMedications));
  return { medications: seedMedications, source: "seed", lastSync: null };
}

function readCachedMedications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Medication[]) : [];
  } catch {
    return [];
  }
}

async function tryLoadFromSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    return [];
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("medicamentos")
    .select("*")
    .order("nome", { ascending: true });

  if (error || !data) {
    console.warn("Não foi possível sincronizar medicamentos do Supabase.", error);
    return [];
  }

  return data as Medication[];
}
