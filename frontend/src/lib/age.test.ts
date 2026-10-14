import { describe, expect, it } from "vitest";
import { makeMedication } from "../test/factories";
import { ageToDays, formatAge, validateMedicationAge } from "./age";

describe("formatAge", () => {
  it.each<[number | null, "Dias" | "Meses" | "Anos", string]>([
    [1, "Dias", "1 dia"],
    [1, "Meses", "1 mês"],
    [1, "Anos", "1 ano"],
    [0, "Dias", "0 dias"],
    [2.5, "Meses", "2,5 meses"],
    [null, "Anos", ""]
  ])("%s %s → '%s'", (valor, unidade, esperado) => {
    expect(formatAge({ value: valor, unit: unidade })).toBe(esperado);
  });
});

describe("ageToDays", () => {
  it.each<[number, "Dias" | "Meses" | "Anos", number]>([
    [10, "Dias", 10],
    [3, "Meses", 91.3125],
    [1, "Anos", 365.25]
  ])("%s %s = %s dias", (valor, unidade, esperado) => {
    expect(ageToDays(valor, unidade)).toBeCloseTo(esperado);
  });

  it("retorna null quando falta valor ou unidade", () => {
    expect(ageToDays(null, "Meses")).toBeNull();
    expect(ageToDays(3, null)).toBeNull();
    expect(ageToDays(Number.NaN, "Meses")).toBeNull();
  });
});

describe("validateMedicationAge", () => {
  const dipirona = makeMedication({
    idade_min_valor: 3,
    idade_min_unidade: "Meses",
    alerta_restricao: "Evitar em menores de 3 meses."
  });

  it("2,5 meses abaixo do mínimo de 3 meses gera alerta cadastrado", () => {
    expect(validateMedicationAge(dipirona, { value: 2.5, unit: "Meses" })).toEqual({
      isRestricted: true,
      message: "Evitar em menores de 3 meses."
    });
  });

  it("compara unidades diferentes (80 dias < 3 meses)", () => {
    expect(validateMedicationAge(dipirona, { value: 80, unit: "Dias" }).isRestricted).toBe(true);
  });

  it("idade dentro da faixa não gera alerta", () => {
    expect(validateMedicationAge(dipirona, { value: 2, unit: "Anos" })).toEqual({
      isRestricted: false,
      message: null
    });
  });

  it("idade exatamente no mínimo não gera alerta", () => {
    expect(validateMedicationAge(dipirona, { value: 3, unit: "Meses" }).isRestricted).toBe(false);
  });

  it("acima da idade máxima gera alerta", () => {
    const medication = makeMedication({
      idade_min_valor: null,
      idade_min_unidade: null,
      idade_max_valor: 12,
      idade_max_unidade: "Anos"
    });

    expect(validateMedicationAge(medication, { value: 13, unit: "Anos" }).isRestricted).toBe(true);
  });

  it("usa mensagem padrão quando não há alerta cadastrado", () => {
    const medication = makeMedication({ alerta_restricao: null });

    expect(validateMedicationAge(medication, { value: 1, unit: "Meses" }).message).toBe(
      "Idade fora da faixa recomendada para este medicamento. Confirme a prescrição."
    );
  });

  it("sem limites cadastrados não gera alerta", () => {
    const medication = makeMedication({ idade_min_valor: null, idade_min_unidade: null });

    expect(validateMedicationAge(medication, { value: 1, unit: "Dias" }).isRestricted).toBe(false);
  });

  it("recém-nascido (idade 0) é validado, não ignorado", () => {
    expect(validateMedicationAge(dipirona, { value: 0, unit: "Dias" }).isRestricted).toBe(true);
  });

  it("idade não informada não gera alerta", () => {
    expect(validateMedicationAge(dipirona, { value: null, unit: "Meses" }).isRestricted).toBe(
      false
    );
  });

  it("sem medicamento não gera alerta", () => {
    expect(validateMedicationAge(null, { value: 1, unit: "Dias" }).isRestricted).toBe(false);
  });
});
