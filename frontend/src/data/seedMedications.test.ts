import { describe, expect, it } from "vitest";
import { calculateDose, concentrationMgPerMl } from "../lib/dose";
import { seedMedications } from "./seedMedications";

describe.each(seedMedications.map((medication) => [medication.nome, medication] as const))(
  "seed %s",
  (_nome, medication) => {
    it("tem concentração em unidade calculável", () => {
      expect(
        concentrationMgPerMl(medication.concentracao_valor, medication.concentracao_unidade)
      ).not.toBeNull();
    });

    it("tem dose alvo, fracionamento e doses máximas positivas", () => {
      expect(medication.dose_alvo_mg_kg_dia).toBeGreaterThan(0);
      expect(medication.fracionamento_vezes_dia).toBeGreaterThan(0);
      expect(medication.dose_max_tomada_mg).toBeGreaterThan(0);
      expect(medication.dose_max_dia_mg).toBeGreaterThan(0);
    });

    it("nunca ultrapassa as doses máximas, mesmo com peso adulto", () => {
      const result = calculateDose(medication, 100, "");

      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.calculation.dosePorTomadaMg).toBeLessThanOrEqual(
          medication.dose_max_tomada_mg as number
        );
        expect(result.calculation.doseDiariaMg).toBeLessThanOrEqual(
          (medication.dose_max_dia_mg as number) + 1e-9
        );
      }
    });
  }
);
