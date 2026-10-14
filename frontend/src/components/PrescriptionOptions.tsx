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

  return (
    <div className="options-row">
      <div className="field">
        <span className="field-label" id="route-label">
          Via
        </span>
        <div className="segmented" role="radiogroup" aria-labelledby="route-label">
          {routeOptions.map((medication) => (
            <button
              key={medication.id}
              type="button"
              role="radio"
              aria-checked={medication.id === selectedMedication.id}
              onClick={() => onRouteChange(medication)}
            >
              {medication.via_administracao}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="duration">
          Duração
        </label>
        <div className="input-shell">
          <input
            id="duration"
            autoComplete="off"
            value={duration}
            placeholder="Ex.: 7 dias"
            onChange={(event) => onDurationChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
