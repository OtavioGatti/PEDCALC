import { Search } from "lucide-react";
import type { Medication } from "../types/medication";

type MedicationSearchProps = {
  medications: Medication[];
  query: string;
  selectedMedication: Medication | null;
  onQueryChange: (value: string) => void;
  onSelect: (medication: Medication) => void;
};

export function MedicationSearch({
  medications,
  query,
  selectedMedication,
  onQueryChange,
  onSelect
}: MedicationSearchProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const results =
    normalizedQuery.length < 2
      ? []
      : medications
          .filter((medication) => {
            const haystack = [
              medication.nome,
              medication.principio_ativo,
              medication.concentracao_valor,
              medication.concentracao_unidade,
              medication.via_administracao,
              medication.tags_busca
            ]
              .join(" ")
              .toLocaleLowerCase("pt-BR");
            return haystack.includes(normalizedQuery);
          })
          .slice(0, 6);

  return (
    <section className="search-section" aria-label="Busca de medicamento">
      <label className="search-shell">
        <Search size={24} strokeWidth={2.4} aria-hidden="true" />
        <input
          value={query}
          placeholder="Buscar medicamento (ex.: amoxicilina, paracetamol...)"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      {results.length > 0 ? (
        <div className="search-results">
          {results.map((medication) => (
            <button key={medication.id} type="button" onClick={() => onSelect(medication)}>
              <strong>{medication.nome}</strong>
              <span>
                {medication.via_administracao} • {medication.concentracao_valor}{" "}
                {medication.concentracao_unidade} •{" "}
                {medication.dose_alvo_mg_kg_dia} mg/kg/dia
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="search-hint">
          {selectedMedication
            ? `${selectedMedication.nome} selecionado`
            : "Busca preditiva - digite pelo menos 2 caracteres"}
        </p>
      )}
    </section>
  );
}
