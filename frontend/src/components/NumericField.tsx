import type { ReactNode } from "react";

type NumericFieldProps = {
  label: string;
  icon: ReactNode;
  value: string;
  suffix?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function NumericField({
  label,
  icon,
  value,
  suffix,
  placeholder,
  onChange
}: NumericFieldProps) {
  return (
    <label className="field-block">
      <span className="field-label">
        {icon}
        {label}
      </span>
      <span className="numeric-shell">
        <input
          inputMode="decimal"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <span>{suffix}</span> : null}
      </span>
    </label>
  );
}
