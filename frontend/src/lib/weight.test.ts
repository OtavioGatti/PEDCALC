import { describe, expect, it } from "vitest";
import type { AgeUnit } from "../types/medication";
import { plausibleWeightRange, validateWeightForAge } from "./weight";

const age = (value: number | null, unit: AgeUnit) => ({ value, unit });

describe("validateWeightForAge", () => {
  it("12,5 kg com 2,5 meses é implausível (caso real de digitação)", () => {
    expect(validateWeightForAge(12.5, age(2.5, "Meses"))).toContain("Para 2,5 meses");
  });

  it.each<[number, number, AgeUnit]>([
    [3.3, 0, "Dias"],
    [1.1, 10, "Dias"],
    [5.5, 2, "Meses"],
    [14, 3, "Anos"],
    [24, 3, "Anos"],
    [32, 10, "Anos"],
    [60, 14, "Anos"],
    [110, 16, "Anos"]
  ])("%s kg com %s %s é plausível", (peso, valor, unidade) => {
    expect(validateWeightForAge(peso, age(valor, unidade))).toBeNull();
  });

  it.each<[number, number, AgeUnit]>([
    [35, 3, "Meses"],
    [1.4, 3, "Anos"],
    [14, 3, "Meses"],
    [3, 10, "Anos"],
    [80, 4, "Anos"]
  ])("%s kg com %s %s é implausível", (peso, valor, unidade) => {
    expect(validateWeightForAge(peso, age(valor, unidade))).not.toBeNull();
  });

  it("sem idade informada só aplica os limites absolutos", () => {
    expect(validateWeightForAge(40, age(null, "Meses"))).toBeNull();
    expect(validateWeightForAge(180, age(null, "Meses"))).toContain("fora da faixa pediátrica");
    expect(validateWeightForAge(0.2, age(null, "Meses"))).toContain("fora da faixa pediátrica");
  });

  it("peso não informado não gera alerta", () => {
    expect(validateWeightForAge(0, age(3, "Anos"))).toBeNull();
  });

  it("acima de 18 anos usa a faixa de 18 anos", () => {
    expect(plausibleWeightRange(age(25, "Anos"))).toEqual(plausibleWeightRange(age(18, "Anos")));
  });

  it("interpola entre os pontos da tabela", () => {
    const range = plausibleWeightRange(age(1.5, "Anos"));

    expect(range?.minKg).toBeCloseTo(4.9, 1);
    expect(range?.maxKg).toBeCloseTo(20.6, 1);
  });
});
