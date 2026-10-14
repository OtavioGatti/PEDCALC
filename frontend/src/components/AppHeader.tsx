import { SlidersHorizontal } from "lucide-react";
import { formatShortDateTime } from "../lib/format";
import type { MedicationLoadResult } from "../lib/medicationRepository";

type AppHeaderProps = {
  loadState: MedicationLoadResult;
  onOpenSettings: () => void;
};

export function AppHeader({ loadState, onOpenSettings }: AppHeaderProps) {
  const status = describeDataStatus(loadState);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <BrandMark />
        <div className="brand-copy">
          <span className="brand-name">PEDCALC</span>
          <span className="brand-tagline">Posologia pediátrica</span>
          <span className={`brand-status ${status.tone}`}>
            <span className="status-dot" aria-hidden="true" />
            {status.label}
          </span>
        </div>
        <span className={`data-status ${status.tone}`}>
          <span className="status-dot" aria-hidden="true" />
          {status.label}
        </span>
        <button
          className="icon-button"
          type="button"
          aria-label="Configurações e status dos dados"
          onClick={onOpenSettings}
        >
          <SlidersHorizontal size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

function describeDataStatus({ source, lastSync }: MedicationLoadResult) {
  if (source === "supabase" && lastSync) {
    return { tone: "ok", label: `Base sincronizada · ${formatShortDateTime(new Date(lastSync))}` };
  }

  if (source === "local") {
    return { tone: "warn", label: "Usando cache offline" };
  }

  return { tone: "warn", label: "Dados de demonstração" };
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 9 7 12 3Z" />
        <path d="M9.5 14h5" />
        <path d="M12 11.5v5" />
      </svg>
    </span>
  );
}
