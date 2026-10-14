import type { ReactElement } from "react";
import { CalendarDays, Clock, Route, Scale } from "lucide-react";
import type { DoseCalculation, Medication, PatientAge } from "../types/medication";
import { formatDateTime, formatDecimal } from "../lib/format";

type PrescriptionCardProps = {
  medication: Medication | null;
  calculation: DoseCalculation | null;
  errorMessage: string | null;
  weightKg: number;
  age: PatientAge;
};

export function PrescriptionCard({
  medication,
  calculation,
  errorMessage,
  weightKg,
  age
}: PrescriptionCardProps) {
  return (
    <section className="prescription-card" aria-label="Resultado da prescrição">
      <div className="prescription-heading">
        <span className="rx-mark" aria-hidden="true">
          R<span>x</span>
        </span>
        <div>
          <h2>Prescrição Calculada</h2>
          <p>{formatDateTime(new Date())}</p>
        </div>
      </div>

      {medication && calculation ? (
        <>
          <div className="prescription-line">
            <span>Medicamento</span>
            <strong>
              {medication.nome} {formatDecimal(medication.concentracao_valor)}{" "}
              {medication.concentracao_unidade}
            </strong>
          </div>

          <div className="dose-grid">
            <div>
              <span>Dose Calculada (por dose)</span>
              <strong>
                {formatDecimal(calculation.dosePorTomadaMg)} mg
                <small>({formatDecimal(calculation.volumePorTomadaMl)} mL)</small>
              </strong>
            </div>
            <div>
              <span>Dose diária</span>
              <strong>
                {formatDecimal(calculation.doseDiariaMg)} mg/dia
                <small className="dose-secondary">
                  {formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia
                </small>
              </strong>
            </div>
          </div>

          {calculation.limitadoPelaDoseMaxima ? (
            <p className="dose-limit-warning" role="alert">
              A dose calculada pelo peso ({formatDecimal(calculation.dosePorTomadaCalculadaMg)} mg
              por dose) excede a dose máxima. Dose limitada a{" "}
              {formatDecimal(calculation.dosePorTomadaMg)} mg por dose.
            </p>
          ) : null}

          <pre className="prescription-text">{calculation.prescriptionText}</pre>

          <div className="patient-strip">
            <InfoItem
              icon={<Scale />}
              label="Peso"
              value={weightKg ? `${formatDecimal(weightKg)} kg` : "-"}
            />
            <InfoItem
              icon={<CalendarDays />}
              label="Idade"
              value={age.value ? `${formatDecimal(age.value)} ${age.unit.toLocaleLowerCase("pt-BR")}` : "-"}
            />
            <InfoItem icon={<Route />} label="Via" value={medication.via_administracao} />
            <InfoItem icon={<Clock />} label="Duração" value={calculation.duracaoTexto || "-"} />
          </div>

          <p className="clinical-note">
            Cálculo baseado em {formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia
            {calculation.limitadoPelaDoseMaxima ? ", limitado à dose máxima" : ""}. Sempre
            confirme diretrizes locais e a bula do medicamento.
          </p>
        </>
      ) : errorMessage ? (
        <div className="empty-prescription">
          <strong>Cálculo indisponível</strong>
          <p className="dose-error" role="alert">
            {errorMessage}
          </p>
        </div>
      ) : (
        <div className="empty-prescription">
          <strong>Informe peso, idade e medicamento.</strong>
          <p>O receituário rápido aparecerá aqui assim que houver dados suficientes.</p>
        </div>
      )}
    </section>
  );
}

function InfoItem({
  icon,
  label,
  value
}: {
  icon: ReactElement;
  label: string;
  value: string;
}) {
  return (
    <div className="info-item">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
