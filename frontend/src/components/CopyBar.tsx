import { Check, Copy, TriangleAlert } from "lucide-react";

export type CopyState = "idle" | "copied" | "error";

type CopyBarProps = {
  disabled: boolean;
  state: CopyState;
  hint: string | null;
  onCopy: () => void;
};

const labels: Record<CopyState, string> = {
  idle: "Copiar prescrição",
  copied: "Prescrição copiada",
  error: "Não foi possível copiar"
};

export function CopyBar({ disabled, state, hint, onCopy }: CopyBarProps) {
  const Icon = state === "copied" ? Check : state === "error" ? TriangleAlert : Copy;

  return (
    <div className="copy-bar">
      <button
        type="button"
        className={`button-primary copy-button is-${state}`}
        disabled={disabled}
        onClick={onCopy}
      >
        <Icon size={19} strokeWidth={2} aria-hidden="true" />
        {labels[state]}
      </button>
      <p className="copy-hint" aria-live="polite">
        {state === "error" ? "Selecione o texto do receituário e copie manualmente." : hint}
      </p>
    </div>
  );
}
