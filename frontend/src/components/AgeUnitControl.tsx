import type { AgeUnit } from "../types/medication";

const units: AgeUnit[] = ["Dias", "Meses", "Anos"];

type AgeUnitControlProps = {
  value: AgeUnit;
  onChange: (value: AgeUnit) => void;
};

export function AgeUnitControl({ value, onChange }: AgeUnitControlProps) {
  return (
    <div className="unit-control" role="radiogroup" aria-label="Unidade da idade">
      {units.map((unit) => (
        <button
          key={unit}
          type="button"
          className={unit === value ? "active" : ""}
          onClick={() => onChange(unit)}
          aria-checked={unit === value}
          role="radio"
        >
          {unit}
        </button>
      ))}
    </div>
  );
}
