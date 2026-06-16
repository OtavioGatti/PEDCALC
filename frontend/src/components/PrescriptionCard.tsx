import { Baby, CalendarDays, Scale } from "lucide-react";
import type { DoseCalculation, Medication, PatientAge } from "../types/medication";
import { formatDateTime, formatDecimal } from "../lib/format";

type PrescriptionCardProps = {
  medication: Medication | null;
  calculation: DoseCalculation | null;
  weightKg: number;
  age: PatientAge;
};

export function PrescriptionCard({
  medication,
  calculation,
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
              <strong>{formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia</strong>
            </div>
          </div>

          <pre className="prescription-text">{calculation.prescriptionText}</pre>

          <div className="patient-strip">
            <InfoItem icon={<Baby />} label="Paciente" value="-" />
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
          </div>

          <p className="clinical-note">
            Cálculo baseado em {formatDecimal(medication.dose_alvo_mg_kg_dia)} mg/kg/dia.
            Sempre confirme diretrizes locais e a bula do medicamento.
          </p>
        </>
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
  icon: React.ReactElement;
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
