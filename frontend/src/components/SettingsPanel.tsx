import { RefreshCw, X } from "lucide-react";
import { formatDateTime } from "../lib/format";
import type { MedicationLoadResult } from "../lib/medicationRepository";

type SettingsPanelProps = {
  isOpen: boolean;
  isRefreshing: boolean;
  loadState: MedicationLoadResult;
  medicationCount: number;
  onClose: () => void;
  onRefresh: () => void;
};

export function SettingsPanel({
  isOpen,
  isRefreshing,
  loadState,
  medicationCount,
  onClose,
  onRefresh
}: SettingsPanelProps) {
  if (!isOpen) {
    return null;
  }

  const sourceLabel =
    loadState.source === "supabase"
      ? "Supabase"
      : loadState.source === "local"
        ? "Cache offline"
        : "Dados demonstrativos";

  const lastSync = loadState.lastSync
    ? formatDateTime(new Date(loadState.lastSync))
    : "Ainda não sincronizado";

  return (
    <div className="settings-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="settings-panel"
        aria-label="Configurações e status"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-heading">
          <div>
            <h2>Status dos dados</h2>
            <p>O app atualiza automaticamente ao abrir ou recarregar.</p>
          </div>
          <button type="button" className="icon-button compact" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <dl className="settings-list">
          <div>
            <dt>Origem</dt>
            <dd>{sourceLabel}</dd>
          </div>
          <div>
            <dt>Última atualização</dt>
            <dd>{lastSync}</dd>
          </div>
          <div>
            <dt>Medicamentos carregados</dt>
            <dd>{medicationCount}</dd>
          </div>
        </dl>

        <button type="button" className="refresh-button" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw size={18} className={isRefreshing ? "spin" : ""} />
          {isRefreshing ? "Atualizando..." : "Atualizar agora"}
        </button>
      </aside>
    </div>
  );
}
