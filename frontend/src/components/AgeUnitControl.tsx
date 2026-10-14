import type { AgeUnit } from "../types/medication";

const units: AgeUnit[] = ["Dias", "Meses", "Anos"];

type AgeUnitControlProps = {
  value: AgeUnit;
  onChange: (value: AgeUnit) => void;
};

export function AgeUnitControl({ value, onChange }: AgeUnitControlProps) {
  return (
    <div className="segmented segmented-lg" role="radiogroup" aria-label="Unidade da idade">
      {units.map((unit) => (
        <button
          key={unit}
          type="button"
          role="radio"
          aria-checked={unit === value}
          onClick={() => onChange(unit)}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
