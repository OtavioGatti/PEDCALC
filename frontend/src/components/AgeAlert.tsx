import { AlertTriangle, ChevronRight } from "lucide-react";

type AgeAlertProps = {
  message: string | null;
};

export function AgeAlert({ message }: AgeAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <aside className="age-alert" role="alert">
      <AlertTriangle size={38} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />
      <div>
        <strong>Atenção: Restrição por Idade</strong>
        <p>{message}</p>
      </div>
      <ChevronRight size={28} strokeWidth={2.5} aria-hidden="true" />
    </aside>
  );
}
