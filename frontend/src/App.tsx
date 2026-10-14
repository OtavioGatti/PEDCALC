import { useEffect, useMemo, useState } from "react";
import { AgeUnitControl } from "./components/AgeUnitControl";
import { AppHeader } from "./components/AppHeader";
import { CopyBar, type CopyState } from "./components/CopyBar";
import { MedicationSearch } from "./components/MedicationSearch";
import { NumericField } from "./components/NumericField";
import { PrescriptionCard, type ClinicalWarning } from "./components/PrescriptionCard";
import { PrescriptionOptions } from "./components/PrescriptionOptions";
import { SettingsPanel } from "./components/SettingsPanel";
import { calculateDose } from "./lib/dose";
import { loadMedications, type MedicationLoadResult } from "./lib/medicationRepository";
import { validateMedicationAge } from "./lib/age";
import { validateWeightForAge } from "./lib/weight";
import type { AdministrationUnit, AgeUnit, Medication } from "./types/medication";

// An empty field is "not informed" (null), which is different from a typed 0.
function parseDecimal(value: string): number | null {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function defaultUnitFor(medication: Medication): AdministrationUnit {
  return medication.gotas_por_ml ? "gotas" : "mL";
}

export default function App() {
  const [weight, setWeight] = useState("");
  const [ageValue, setAgeValue] = useState("");
  const [ageUnit, setAgeUnit] = useState<AgeUnit>("Meses");
  const [query, setQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [duration, setDuration] = useState("");
  const [doseUnit, setDoseUnit] = useState<AdministrationUnit>("mL");
  const [loadState, setLoadState] = useState<MedicationLoadResult>({
    medications: [],
    source: "seed",
    lastSync: null
  });
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [warningsAcknowledged, setWarningsAcknowledged] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshMedications();
  }, []);

  const weightKg = parseDecimal(weight) ?? 0;
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
  const doseResult = calculateDose(selectedMedication, weightKg, duration, doseUnit);
  const calculation = doseResult.status === "ok" ? doseResult.calculation : null;
  const ageValidation = validateMedicationAge(selectedMedication, patientAge);
  const weightWarning = validateWeightForAge(weightKg, patientAge);

  const warnings: ClinicalWarning[] = [];
  if (ageValidation.message) {
    warnings.push({ id: "age", title: "Restrição por idade", message: ageValidation.message });
  }
  if (weightWarning) {
    warnings.push({ id: "weight", title: "Peso incomum para a idade", message: weightWarning });
  }

  const needsAcknowledgement = warnings.length > 0 && !warningsAcknowledged;

  // Any change to the patient or the medication invalidates a previous acknowledgement.
  function resetForPatientChange() {
    setCopyState("idle");
    setWarningsAcknowledged(false);
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
    setDoseUnit(defaultUnitFor(medication));
    resetForPatientChange();
  }

  function selectRoute(medication: Medication) {
    setSelectedMedication(medication);
    setDuration(medication.duracao_tratamento_padrao);
    setDoseUnit(defaultUnitFor(medication));
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
      ? "Confirme os alertas acima para liberar a cópia."
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
                invalid={weightWarning !== null}
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
            warnings={warnings}
            warningsAcknowledged={warningsAcknowledged}
            onWarningsAcknowledgedChange={setWarningsAcknowledged}
            doseUnit={doseUnit}
            onDoseUnitChange={(unit) => {
              setDoseUnit(unit);
              setCopyState("idle");
            }}
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
