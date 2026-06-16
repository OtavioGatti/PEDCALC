import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Scale } from "lucide-react";
import { AgeAlert } from "./components/AgeAlert";
import { AgeUnitControl } from "./components/AgeUnitControl";
import { AppHeader } from "./components/AppHeader";
import { CopyBar } from "./components/CopyBar";
import { MedicationSearch } from "./components/MedicationSearch";
import { NumericField } from "./components/NumericField";
import { PrescriptionCard } from "./components/PrescriptionCard";
import { calculateDose } from "./lib/dose";
import { formatDateTime } from "./lib/format";
import { loadMedications, type MedicationLoadResult } from "./lib/medicationRepository";
import { validateMedicationAge } from "./lib/age";
import type { AgeUnit, Medication } from "./types/medication";
import "./index.css";

function parseDecimal(value: string) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function App() {
  const [weight, setWeight] = useState("12,5");
  const [ageValue, setAgeValue] = useState("2,5");
  const [ageUnit, setAgeUnit] = useState<AgeUnit>("Meses");
  const [query, setQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [loadState, setLoadState] = useState<MedicationLoadResult>({
    medications: [],
    source: "seed",
    lastSync: null
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadMedications().then((result) => {
      if (!mounted) {
        return;
      }
      setLoadState(result);
      setSelectedMedication(result.medications[0] ?? null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const weightKg = parseDecimal(weight);
  const patientAge = useMemo(
    () => ({ value: parseDecimal(ageValue), unit: ageUnit }),
    [ageValue, ageUnit]
  );
  const calculation = calculateDose(selectedMedication, weightKg);
  const ageValidation = validateMedicationAge(selectedMedication, patientAge);

  function selectMedication(medication: Medication) {
    setSelectedMedication(medication);
    setQuery(medication.nome);
    setCopied(false);
  }

  async function copyPrescription() {
    if (!calculation) {
      return;
    }

    await navigator.clipboard.writeText(calculation.prescriptionText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const sourceText =
    loadState.source === "supabase"
      ? `Sincronizado ${
          loadState.lastSync ? formatDateTime(new Date(loadState.lastSync)) : "agora"
        }`
      : loadState.source === "local"
        ? "Dados locais offline"
        : "Dados demonstrativos";

  return (
    <main className="app-shell">
      <AppHeader />

      <section className="inputs-grid" aria-label="Dados do paciente">
        <NumericField
          label="Peso (kg)"
          icon={<Scale size={24} strokeWidth={2.4} />}
          value={weight}
          suffix="kg"
          placeholder="0"
          onChange={(value) => {
            setWeight(value);
            setCopied(false);
          }}
        />

        <div className="age-field">
          <NumericField
            label="Idade"
            icon={<CalendarDays size={24} strokeWidth={2.4} />}
            value={ageValue}
            placeholder="0"
            onChange={(value) => {
              setAgeValue(value);
              setCopied(false);
            }}
          />
          <AgeUnitControl value={ageUnit} onChange={setAgeUnit} />
        </div>
      </section>

      <MedicationSearch
        medications={loadState.medications}
        query={query}
        selectedMedication={selectedMedication}
        onQueryChange={(value) => {
          setQuery(value);
          setCopied(false);
        }}
        onSelect={selectMedication}
      />

      <p className="source-line">{sourceText}</p>

      <AgeAlert message={ageValidation.message} />

      <PrescriptionCard
        medication={selectedMedication}
        calculation={calculation}
        weightKg={weightKg}
        age={patientAge}
      />

      <CopyBar disabled={!calculation} copied={copied} onCopy={copyPrescription} />
    </main>
  );
}
