import { Clock, Route } from "lucide-react";
import type { Medication } from "../types/medication";

type PrescriptionOptionsProps = {
  duration: string;
  routeOptions: Medication[];
  selectedMedication: Medication | null;
  onDurationChange: (value: string) => void;
  onRouteChange: (medication: Medication) => void;
};

export function PrescriptionOptions({
  duration,
  routeOptions,
  selectedMedication,
  onDurationChange,
  onRouteChange
}: PrescriptionOptionsProps) {
  if (!selectedMedication) {
    return null;
  }

  const selectorClassName = [
    "route-selector",
    routeOptions.length === 1 ? "single-route" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="prescription-options" aria-label="Opções da prescrição">
      <label className="option-field">
        <span>
          <Clock size={19} />
          Duração
        </span>
        <input
          value={duration}
          placeholder="Ex.: 3 dias"
          onChange={(event) => onDurationChange(event.target.value)}
        />
      </label>

      <div className="option-field">
        <span>
          <Route size={19} />
          Via
        </span>
        <div className={selectorClassName} role="radiogroup" aria-label="Via de administração">
          {routeOptions.map((medication) => (
            <button
              key={medication.id}
              type="button"
              role="radio"
              aria-checked={medication.id === selectedMedication.id}
              className={medication.id === selectedMedication.id ? "active" : ""}
              onClick={() => onRouteChange(medication)}
            >
              {medication.via_administracao}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
