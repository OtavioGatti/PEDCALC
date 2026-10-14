import { useEffect, useMemo, useState } from "react";
import { AgeUnitControl } from "./components/AgeUnitControl";
import { AppHeader } from "./components/AppHeader";
import { CopyBar, type CopyState } from "./components/CopyBar";
import { MedicationSearch } from "./components/MedicationSearch";
import { NumericField } from "./components/NumericField";
import { PrescriptionCard } from "./components/PrescriptionCard";
import { PrescriptionOptions } from "./components/PrescriptionOptions";
import { SettingsPanel } from "./components/SettingsPanel";
import { calculateDose } from "./lib/dose";
import { loadMedications, type MedicationLoadResult } from "./lib/medicationRepository";
import { validateMedicationAge } from "./lib/age";
import type { AgeUnit, Medication } from "./types/medication";

function parseDecimal(value: string) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function App() {
  const [weight, setWeight] = useState("");
  const [ageValue, setAgeValue] = useState("");
  const [ageUnit, setAgeUnit] = useState<AgeUnit>("Meses");
  const [query, setQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [duration, setDuration] = useState("");
  const [loadState, setLoadState] = useState<MedicationLoadResult>({
    medications: [],
    source: "seed",
    lastSync: null
  });
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [ageAcknowledged, setAgeAcknowledged] = useState(false);
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
  const doseResult = calculateDose(selectedMedication, weightKg, duration);
  const calculation = doseResult.status === "ok" ? doseResult.calculation : null;
  const ageValidation = validateMedicationAge(selectedMedication, patientAge);

  const needsAcknowledgement = ageValidation.isRestricted && !ageAcknowledged;

  // Any change to the patient or the medication invalidates a previous acknowledgement.
  function resetForPatientChange() {
    setCopyState("idle");
    setAgeAcknowledged(false);
  }

  async function refreshMedications() {
    setIsRefreshing(true);
    try {
      const result = await loadMedications();

      setLoadState(result);
      setSelectedMedication((current) => {
        const next =
          (current && result.medications.find((medication) => medication.id === current.id)) ?? null;
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
    resetForPatientChange();
  }

  function selectRoute(medication: Medication) {
    setSelectedMedication(medication);
    setDuration(medication.duracao_tratamento_padrao);
    resetForPatientChange();
  }

  async function copyPrescription() {
    if (!calculation || needsAcknowledgement) {
      return;
    }

    try {
      await navigator.clipboard.writeText(calculation.prescriptionText);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  const copyHint = !calculation
    ? null
    : needsAcknowledgement
      ? "Confirme a restrição por idade para liberar a cópia."
      : null;

  return (
    <div className="app">
      <AppHeader loadState={loadState} onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        isRefreshing={isRefreshing}
        loadState={loadState}
        medicationCount={loadState.medications.length}
        onClose={() => setIsSettingsOpen(false)}
        onRefresh={() => refreshMedications()}
      />

      <main className="app-main">
        <div className="input-column">
          <section className="panel" aria-labelledby="patient-title">
            <h2 className="panel-title" id="patient-title">
              Paciente
            </h2>
            <div className="patient-fields">
              <NumericField
                id="weight"
                label="Peso"
                value={weight}
                suffix="kg"
                placeholder="0"
                onChange={(value) => {
                  setWeight(value);
                  resetForPatientChange();
                }}
              />
              <NumericField
                id="age"
                label="Idade"
                value={ageValue}
                placeholder="0"
                invalid={ageValidation.isRestricted}
                addon={
                  <AgeUnitControl
                    value={ageUnit}
                    onChange={(unit) => {
                      setAgeUnit(unit);
                      resetForPatientChange();
                    }}
                  />
                }
                onChange={(value) => {
                  setAgeValue(value);
                  resetForPatientChange();
                }}
              />
            </div>
          </section>

          <section className="panel" aria-labelledby="medication-title">
            <h2 className="panel-title" id="medication-title">
              Medicamento
            </h2>
            <MedicationSearch
              medications={loadState.medications}
              query={query}
              selectedMedication={selectedMedication}
              onQueryChange={(value) => {
                setQuery(value);
                setCopyState("idle");
              }}
              onSelect={selectMedication}
            />
            <PrescriptionOptions
              duration={duration}
              routeOptions={routeOptions}
              selectedMedication={selectedMedication}
              onDurationChange={(value) => {
                setDuration(value);
                setCopyState("idle");
              }}
              onRouteChange={selectRoute}
            />
          </section>
        </div>

        <div className="result-column">
          <PrescriptionCard
            medication={selectedMedication}
            calculation={calculation}
            errorMessage={doseResult.status === "error" ? doseResult.message : null}
            weightKg={weightKg}
            age={patientAge}
            ageAlert={ageValidation.message}
            ageAcknowledged={ageAcknowledged}
            onAgeAcknowledgedChange={setAgeAcknowledged}
          />
          <CopyBar
            disabled={!calculation || needsAcknowledgement}
            state={copyState}
            hint={copyHint}
            onCopy={copyPrescription}
          />
        </div>
      </main>
    </div>
  );
}
