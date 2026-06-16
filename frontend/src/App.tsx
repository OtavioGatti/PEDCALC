import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Scale } from "lucide-react";
import { AgeAlert } from "./components/AgeAlert";
import { AgeUnitControl } from "./components/AgeUnitControl";
import { AppHeader } from "./components/AppHeader";
import { CopyBar } from "./components/CopyBar";
import { MedicationSearch } from "./components/MedicationSearch";
import { NumericField } from "./components/NumericField";
import { PrescriptionCard } from "./components/PrescriptionCard";
import { PrescriptionOptions } from "./components/PrescriptionOptions";
import { SettingsPanel } from "./components/SettingsPanel";
import { calculateDose } from "./lib/dose";
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
  const [duration, setDuration] = useState("");
  const [loadState, setLoadState] = useState<MedicationLoadResult>({
    medications: [],
    source: "seed",
    lastSync: null
  });
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshMedications();
  }, []);

  const weightKg = parseDecimal(weight);
  const patientAge = useMemo(
    () => ({ value: parseDecimal(ageValue), unit: ageUnit }),
    [ageValue, ageUnit]
  );
  const routeOptions = useMemo(() => {
    if (!selectedMedication) {
      return [];
    }

    const matchingMedications = loadState.medications.filter(
      (medication) =>
        medication.nome === selectedMedication.nome &&
        medication.principio_ativo === selectedMedication.principio_ativo
    );

    const uniqueByRoute = new Map<string, Medication>();
    for (const medication of matchingMedications) {
      uniqueByRoute.set(medication.via_administracao, medication);
    }

    return Array.from(uniqueByRoute.values());
  }, [loadState.medications, selectedMedication]);
  const calculation = calculateDose(selectedMedication, weightKg, duration);
  const ageValidation = validateMedicationAge(selectedMedication, patientAge);

  async function refreshMedications() {
    setIsRefreshing(true);
    try {
      const result = await loadMedications();

      setLoadState(result);
      setSelectedMedication((current) => {
        const next =
          (current && result.medications.find((medication) => medication.id === current.id)) ??
          result.medications[0] ??
          null;
        setDuration(next?.duracao_tratamento_padrao ?? "");
        return next;
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  function selectMedication(medication: Medication) {
    setSelectedMedication(medication);
    setQuery(medication.nome);
    setDuration(medication.duracao_tratamento_padrao);
    setCopied(false);
  }

  function selectRoute(medication: Medication) {
    setSelectedMedication(medication);
    setDuration(medication.duracao_tratamento_padrao);
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

  return (
    <main className="app-shell">
      <AppHeader onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        isRefreshing={isRefreshing}
        loadState={loadState}
        medicationCount={loadState.medications.length}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={() => refreshMedications()}
      />

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

      <PrescriptionOptions
        duration={duration}
        routeOptions={routeOptions}
        selectedMedication={selectedMedication}
        onDurationChange={(value) => {
          setDuration(value);
          setCopied(false);
        }}
        onRouteChange={selectRoute}
      />

      <AgeAlert message={ageValidation.message} />

      <PrescriptionCard
        medication={selectedMedication}
        calculation={calculation}
        weightKg={weightKg}
        age={patientAge}
        duration={duration}
      />

      <CopyBar disabled={!calculation} copied={copied} onCopy={copyPrescription} />
    </main>
  );
}
