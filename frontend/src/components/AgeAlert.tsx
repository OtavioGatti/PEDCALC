import { ChevronRight } from "lucide-react";

type AgeAlertProps = {
  message: string | null;
};

export function AgeAlert({ message }: AgeAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <aside className="age-alert" role="alert">
      <svg className="alert-icon" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M18.3 5.4c.8-1.4 2.8-1.4 3.6 0l15 26c.8 1.4-.2 3.1-1.8 3.1H5.1c-1.6 0-2.6-1.7-1.8-3.1l15-26Z" />
        <path d="M20 14v9" />
        <circle cx="20" cy="28" r="1.8" />
      </svg>
      <div>
        <strong>Atenção: Restrição por Idade</strong>
        <p>{message}</p>
      </div>
      <ChevronRight size={28} strokeWidth={2.5} aria-hidden="true" />
    </aside>
  );
}
