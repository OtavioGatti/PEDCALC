import { Info, TriangleAlert } from "lucide-react";
import type { DoseCalculation, Medication, PatientAge } from "../types/medication";
import { formatDateTime, formatDecimal } from "../lib/format";

type PrescriptionCardProps = {
  medication: Medication | null;
  calculation: DoseCalculation | null;
  errorMessage: string | null;
  weightKg: number;
  age: PatientAge;
  ageAlert: string | null;
  ageAcknowledged: boolean;
  onAgeAcknowledgedChange: (value: boolean) => void;
};

export function PrescriptionCard({
  medication,
  calculation,
  errorMessage,
  weightKg,
  age,
  ageAlert,
  ageAcknowledged,
  onAgeAcknowledgedChange
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

      {ageAlert || calculation.limitadoPelaDoseMaxima ? (
        <div className="result-notices">
          {ageAlert ? (
            <div className="notice notice-warn" role="alert">
              <div className="notice-body">
                <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />
                <div>
                  <strong>Restrição por idade</strong>
                  <p>{ageAlert}</p>
                </div>
              </div>
              <label className="notice-confirm">
                <input
                  type="checkbox"
                  checked={ageAcknowledged}
                  onChange={(event) => onAgeAcknowledgedChange(event.target.checked)}
                />
                Revisei a restrição e quero prosseguir
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
        <span className="dose-hero-label">Administrar por dose</span>
        <div className="dose-hero-value">
          <span>{formatDecimal(calculation.volumePorTomadaMl)}</span>
          <span className="dose-hero-unit">mL</span>
        </div>
        <span className="dose-hero-detail">
          {formatDecimal(calculation.dosePorTomadaMg)} mg · {calculation.viaTexto} ·{" "}
          {calculation.frequenciaTexto}
          {calculation.duracaoTexto ? ` · por ${calculation.duracaoTexto}` : ""}
        </span>
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
          {age.value ? (
            <li>
              {formatDecimal(age.value)} {age.unit.toLocaleLowerCase("pt-BR")}
            </li>
          ) : null}
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
