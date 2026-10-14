import { Info, TriangleAlert } from "lucide-react";
import type {
  AdministrationUnit,
  DoseCalculation,
  Medication,
  PatientAge
} from "../types/medication";
import { formatAge } from "../lib/age";
import { formatDateTime, formatDecimal } from "../lib/format";

export type ClinicalWarning = {
  id: string;
  title: string;
  message: string;
};

type PrescriptionCardProps = {
  medication: Medication | null;
  calculation: DoseCalculation | null;
  errorMessage: string | null;
  weightKg: number;
  age: PatientAge;
  warnings: ClinicalWarning[];
  warningsAcknowledged: boolean;
  onWarningsAcknowledgedChange: (value: boolean) => void;
  doseUnit: AdministrationUnit;
  onDoseUnitChange: (unit: AdministrationUnit) => void;
};

const doseUnits: Array<{ value: AdministrationUnit; label: string }> = [
  { value: "mL", label: "mL" },
  { value: "gotas", label: "Gotas" }
];

export function PrescriptionCard({
  medication,
  calculation,
  errorMessage,
  weightKg,
  age,
  warnings,
  warningsAcknowledged,
  onWarningsAcknowledgedChange,
  doseUnit,
  onDoseUnitChange
}: PrescriptionCardProps) {
  if (!medication || !calculation) {
    return (
      <section className="result-card" aria-label="Prescrição calculada">
        <div className="result-empty">
          {errorMessage ? (
            <>
              <strong>Cálculo indisponível</strong>
              <p className="result-error" role="alert">
                {errorMessage}
              </p>
            </>
          ) : (
            <>
              <strong>Informe peso, idade e medicamento</strong>
              <p>A dose e o receituário aparecem aqui assim que os dados estiverem completos.</p>
            </>
          )}
        </div>
      </section>
    );
  }

  const { receita } = calculation;
  const showingDrops = calculation.unidadeAplicada === "gotas";
  const concentration = `${formatDecimal(medication.concentracao_valor)} ${medication.concentracao_unidade}`;

  return (
    <section className="result-card" aria-label="Prescrição calculada">
      <div className="result-header">
        <div>
          <span className="result-eyebrow">Prescrição calculada</span>
          <h2>
            {medication.nome} {concentration}
          </h2>
        </div>
        <span className="result-time">{formatDateTime(new Date())}</span>
      </div>

      {warnings.length > 0 || calculation.limitadoPelaDoseMaxima ? (
        <div className="result-notices">
          {warnings.length > 0 ? (
            <div className="notice notice-warn" role="alert">
              {warnings.map((warning) => (
                <div className="notice-body" key={warning.id}>
                  <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />
                  <div>
                    <strong>{warning.title}</strong>
                    <p>{warning.message}</p>
                  </div>
                </div>
              ))}
              <label className="notice-confirm">
                <input
                  type="checkbox"
                  checked={warningsAcknowledged}
                  onChange={(event) => onWarningsAcknowledgedChange(event.target.checked)}
                />
                {warnings.length > 1
                  ? "Revisei os alertas e quero prosseguir"
                  : "Revisei o alerta e quero prosseguir"}
              </label>
            </div>
          ) : null}

          {calculation.limitadoPelaDoseMaxima ? (
            <div className="notice notice-info" role="status">
              <div className="notice-body">
                <Info size={20} strokeWidth={2} aria-hidden="true" />
                <div>
                  <strong>Limitado à dose máxima</strong>
                  <p>
                    Pelo peso seriam {formatDecimal(calculation.dosePorTomadaCalculadaMg)} mg por
                    dose. Ajustado para {formatDecimal(calculation.dosePorTomadaMg)} mg.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="dose-hero">
        <div className="dose-hero-top">
          <span className="dose-hero-label">Administrar por dose</span>
          <div className="segmented segmented-sm" role="radiogroup" aria-label="Unidade da dose">
            {doseUnits.map((unit) => (
              <button
                key={unit.value}
                type="button"
                role="radio"
                aria-checked={doseUnit === unit.value}
                onClick={() => onDoseUnitChange(unit.value)}
              >
                {unit.label}
              </button>
            ))}
          </div>
        </div>
        <div className="dose-hero-value">
          {showingDrops ? (
            <>
              <span>{calculation.gotasPorTomada}</span>
              <span className="dose-hero-unit">
                {calculation.gotasPorTomada === 1 ? "gota" : "gotas"}
              </span>
            </>
          ) : (
            <>
              <span>{formatDecimal(calculation.volumePorTomadaMl)}</span>
              <span className="dose-hero-unit">mL</span>
            </>
          )}
        </div>
        <span className="dose-hero-detail">
          {formatDecimal(calculation.dosePorTomadaMg)} mg
          {showingDrops ? ` · ${formatDecimal(calculation.volumePorTomadaMl)} mL` : ""} ·{" "}
          {calculation.viaTexto} · {calculation.frequenciaTexto}
          {calculation.duracaoTexto ? ` · por ${calculation.duracaoTexto}` : ""}
        </span>
        {doseUnit === "gotas" ? <DropsNote calculation={calculation} /> : null}
      </div>

      <dl className="dose-stats">
        <div>
          <dt>Dose diária</dt>
          <dd>{formatDecimal(calculation.doseDiariaMg)} mg/dia</dd>
        </div>
        <div>
          <dt>Dose alvo</dt>
          <dd>{formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia</dd>
        </div>
        {medication.dose_max_tomada_mg ? (
          <div>
            <dt>Dose máxima</dt>
            <dd>{formatDecimal(medication.dose_max_tomada_mg)} mg/dose</dd>
          </div>
        ) : null}
      </dl>

      <div className="prescription">
        <span className="section-eyebrow">Receituário</span>
        <div className="prescription-paper">
          <strong>{receita.titulo}</strong>
          <div className="prescription-item">
            <strong>1. {receita.item}</strong>
            <span className="prescription-leader" aria-hidden="true" />
            <span>{receita.quantidade}</span>
          </div>
          <p>{receita.posologia}</p>
          {receita.observacao ? <p className="prescription-note">{receita.observacao}</p> : null}
        </div>
      </div>

      <div className="result-footer">
        <ul className="patient-chips" aria-label="Dados usados no cálculo">
          <li>{formatDecimal(weightKg)} kg</li>
          {age.value !== null ? <li>{formatAge(age)}</li> : null}
          <li>{medication.via_administracao}</li>
          {calculation.duracaoTexto ? <li>{calculation.duracaoTexto}</li> : null}
        </ul>
        <p className="clinical-note">
          Cálculo baseado em {formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia
          {calculation.limitadoPelaDoseMaxima ? ", limitado à dose máxima" : ""}. Confirme
          diretrizes locais e a bula do medicamento.
        </p>
      </div>
    </section>
  );
}

function DropsNote({ calculation }: { calculation: DoseCalculation }) {
  if (calculation.gotasPorTomada === null) {
    return (
      <p className="drops-note is-warning">
        A dose é menor que 1 gota ({formatDecimal(calculation.gotasPorTomadaExatas)} calculada). A
        prescrição foi mantida em mL.
      </p>
    );
  }

  const rounded = Math.abs(calculation.gotasPorTomada - calculation.gotasPorTomadaExatas) >= 0.05;
  const factor = `${formatDecimal(calculation.gotasPorMl)} gotas/mL`;

  return (
    <p className={`drops-note${calculation.gotasFatorPadrao ? " is-warning" : ""}`}>
      {calculation.gotasFatorPadrao
        ? `Fator padrão de ${factor}: confirme na bula, pois varia entre apresentações.`
        : `Conversão: ${factor}.`}
      {rounded
        ? ` Arredondado de ${formatDecimal(calculation.gotasPorTomadaExatas, 1)} gotas${
            calculation.limitadoPelaDoseMaxima ? " para baixo, sem passar da dose máxima" : ""
          }.`
        : ""}
    </p>
  );
}
