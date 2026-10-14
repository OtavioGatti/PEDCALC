import { useRef } from "react";
import { Search } from "lucide-react";
import { formatDecimal } from "../lib/format";
import type { Medication } from "../types/medication";

type MedicationSearchProps = {
  medications: Medication[];
  query: string;
  selectedMedication: Medication | null;
  onQueryChange: (value: string) => void;
  onSelect: (medication: Medication) => void;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function MedicationSearch({
  medications,
  query,
  selectedMedication,
  onQueryChange,
  onSelect
}: MedicationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalizeSearch(query);
  const isShowingSelection = selectedMedication !== null && query === selectedMedication.nome;
  const isSearching = normalizedQuery.length >= 2 && !isShowingSelection;

  const results = isSearching
    ? medications
        .filter((medication) =>
          normalizeSearch(
            [
              medication.nome,
              medication.principio_ativo,
              medication.concentracao_valor,
              medication.concentracao_unidade,
              medication.via_administracao,
              medication.tags_busca
            ].join(" ")
          ).includes(normalizedQuery)
        )
        .slice(0, 6)
    : [];

  function changeMedication() {
    onQueryChange("");
    inputRef.current?.focus();
  }

  return (
    <div className="med-search">
      <label className="input-shell search-shell">
        <Search size={18} strokeWidth={2} aria-hidden="true" />
        <input
          ref={inputRef}
          aria-label="Buscar medicamento"
          autoComplete="off"
          value={query}
          placeholder="Buscar por nome, princípio ativo ou indicação"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      {isSearching ? (
        results.length > 0 ? (
          <ul className="search-results" aria-label="Resultados da busca">
            {results.map((medication) => (
              <li key={medication.id}>
                <button type="button" onClick={() => onSelect(medication)}>
                  <strong>{medication.nome}</strong>
                  <span>
                    {formatDecimal(medication.concentracao_valor)} {medication.concentracao_unidade}{" "}
                    · {medication.via_administracao} ·{" "}
                    {formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="field-hint">Nenhum medicamento encontrado para “{query.trim()}”.</p>
        )
      ) : null}

      {selectedMedication ? (
        <div className="selected-med">
          <div>
            <strong>{selectedMedication.nome}</strong>
            <span>
              {selectedMedication.principio_ativo} ·{" "}
              {formatDecimal(selectedMedication.concentracao_valor)}{" "}
              {selectedMedication.concentracao_unidade} ·{" "}
              {formatDecimal(selectedMedication.dose_alvo_mg_kg_dia)} mg/kg/dia
            </span>
          </div>
          <button type="button" className="button-secondary" onClick={changeMedication}>
            Trocar
          </button>
        </div>
      ) : !isSearching ? (
        <p className="field-hint">Digite pelo menos 2 letras para buscar.</p>
      ) : null}
    </div>
  );
}
