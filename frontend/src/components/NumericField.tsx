import type { ReactNode } from "react";

type NumericFieldProps = {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  placeholder?: string;
  invalid?: boolean;
  addon?: ReactNode;
  onChange: (value: string) => void;
};

export function NumericField({
  id,
  label,
  value,
  suffix,
  placeholder,
  invalid = false,
  addon,
  onChange
}: NumericFieldProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-row">
        <div className={`input-shell input-lg${invalid ? " is-warning" : ""}`}>
          <input
            id={id}
            inputMode="decimal"
            type="text"
            autoComplete="off"
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
          {suffix ? <span className="input-suffix">{suffix}</span> : null}
        </div>
        {addon}
      </div>
    </div>
  );
}
