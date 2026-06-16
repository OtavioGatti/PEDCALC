import { Calculator, Settings } from "lucide-react";

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand-mark" aria-hidden="true">
        <Calculator size={32} strokeWidth={2.4} />
      </div>
      <div className="brand-copy">
        <h1>
          PED<span>CALC</span>
        </h1>
        <p>Calculadora Pediátrica Offline</p>
      </div>
      <button className="icon-button" type="button" aria-label="Configurações">
        <Settings size={25} strokeWidth={2.5} />
      </button>
    </header>
  );
}
