import { describe, expect, it } from "vitest";
import { makeMedication } from "../test/factories";
import type { DoseCalculation, DoseResult, Medication } from "../types/medication";
import { calculateDose, concentrationMgPerMl, formatTreatmentDuration, frequencyText } from "./dose";

function calc(medication: Medication, weightKg: number, duration = ""): DoseCalculation {
  const result = calculateDose(medication, weightKg, duration);
  if (result.status !== "ok") {
    throw new Error(`Esperava cálculo ok, recebeu ${JSON.stringify(result)}`);
  }
  return result.calculation;
}

describe("calculateDose: entradas incompletas", () => {
  it.each<[string, Medication | null, number]>([
    ["sem medicamento", null, 12.5],
    ["peso zero", makeMedication(), 0],
    ["peso negativo", makeMedication(), -5],
    ["peso NaN", makeMedication(), Number.NaN]
  ])("%s retorna status empty", (_label, medication, weight) => {
    expect(calculateDose(medication, weight, "")).toEqual<DoseResult>({ status: "empty" });
  });
});

describe("calculateDose: cálculo base", () => {
  it("calcula dose por tomada, dose diária e volume (dipirona 12,5 kg)", () => {
    const result = calc(makeMedication(), 12.5);

    expect(result.dosePorTomadaMg).toBeCloseTo(187.5);
    expect(result.doseDiariaMg).toBeCloseTo(750);
    expect(result.volumePorTomadaMl).toBeCloseTo(0.375);
    expect(result.intervaloHoras).toBe(6);
    expect(result.limitadoPelaDoseMaxima).toBe(false);
  });

  it("gera a frequência como 'de 6 em 6 horas', nunca '6/6 em 6/6'", () => {
    const { prescriptionText } = calc(makeMedication(), 12.5);

    expect(prescriptionText).toContain("Dar 0,38 mL por via oral de 6 em 6 horas.");
    expect(prescriptionText).not.toContain("6/6");
  });

  it("monta o receituário completo com duração e observação", () => {
    const medication = makeMedication({
      texto_prescricao_padrao: "Usar se dor ou febre."
    });

    expect(calc(medication, 12.5, "3").prescriptionText).toBe(
      [
        "Uso Oral",
        "1. Dipirona (500 mg/mL) ------- 1 Frasco",
        "   Dar 0,38 mL por via oral de 6 em 6 horas por 3 dias.",
        "   Usar se dor ou febre."
      ].join("\n")
    );
  });

  it("omite a linha de observação quando não há texto padrão", () => {
    expect(calc(makeMedication(), 10).prescriptionText.split("\n")).toHaveLength(3);
  });

  it("remove da observação a duração que já vai na linha de posologia", () => {
    const medication = makeMedication({
      texto_prescricao_padrao: "Administrar por 7 dias. Agitar antes de usar."
    });

    expect(calc(medication, 10).prescriptionText).toContain("   Agitar antes de usar.");
    expect(calc(medication, 10).prescriptionText).not.toMatch(/administrar por 7 dias/i);
  });

  it.each([
    ["EV", "Uso Endovenoso", "via endovenosa"],
    ["ev", "Uso Endovenoso", "via endovenosa"],
    ["IM", "Uso Intramuscular", "via intramuscular"],
    ["SC", "Uso Subcutâneo", "via subcutânea"],
    ["IN", "Uso Inalatório", "via inalatória"],
    ["VO", "Uso Oral", "via oral"],
    ["desconhecida", "Uso Oral", "via oral"]
  ])("via %s gera '%s' e '%s'", (via, titulo, viaTexto) => {
    const result = calc(makeMedication({ via_administracao: via }), 10);

    expect(result.usoTitulo).toBe(titulo);
    expect(result.viaTexto).toBe(viaTexto);
    expect(result.prescriptionText.startsWith(titulo)).toBe(true);
  });
});

describe("calculateDose: unidade da concentração", () => {
  it("amoxicilina 250 mg/5 mL: 15 kg a 50 mg/kg/dia 8/8h dá 5 mL (não 1 mL)", () => {
    const medication = makeMedication({
      nome: "Amoxicilina",
      concentracao_valor: 250,
      concentracao_unidade: "mg/5 mL",
      dose_alvo_mg_kg_dia: 50,
      fracionamento_vezes_dia: 3
    });
    const result = calc(medication, 15, "7");

    expect(result.dosePorTomadaMg).toBeCloseTo(250);
    expect(result.volumePorTomadaMl).toBeCloseTo(5);
    expect(result.prescriptionText).toContain("Dar 5 mL por via oral de 8 em 8 horas por 7 dias.");
  });

  it.each(["UI/mL", "mg/gota", "mg/comprimido", "mg", ""])(
    "unidade '%s' bloqueia o cálculo com mensagem de erro",
    (unidade) => {
      const result = calculateDose(makeMedication({ concentracao_unidade: unidade }), 10, "");

      expect(result.status).toBe("error");
      if (result.status === "error") {
        expect(result.message).toContain("não é suportada");
      }
    }
  );
});

describe("calculateDose: dose máxima", () => {
  it("sem limites cadastrados, não limita a dose", () => {
    const result = calc(makeMedication(), 80);

    expect(result.dosePorTomadaMg).toBeCloseTo(1200);
    expect(result.limitadoPelaDoseMaxima).toBe(false);
  });

  it("limita pela dose máxima por tomada", () => {
    const result = calc(makeMedication({ dose_max_tomada_mg: 1000 }), 80);

    expect(result.dosePorTomadaCalculadaMg).toBeCloseTo(1200);
    expect(result.dosePorTomadaMg).toBeCloseTo(1000);
    expect(result.doseDiariaMg).toBeCloseTo(4000);
    expect(result.volumePorTomadaMl).toBeCloseTo(2);
    expect(result.limitadoPelaDoseMaxima).toBe(true);
    expect(result.prescriptionText).toContain("Dar 2 mL");
  });

  it("limita pela dose máxima diária dividida pelo fracionamento", () => {
    const result = calc(makeMedication({ dose_max_tomada_mg: 1000, dose_max_dia_mg: 3000 }), 80);

    expect(result.dosePorTomadaMg).toBeCloseTo(750);
    expect(result.doseDiariaMg).toBeCloseTo(3000);
    expect(result.limitadoPelaDoseMaxima).toBe(true);
  });

  it("dose exatamente no limite não é marcada como limitada", () => {
    const result = calc(makeMedication({ dose_max_tomada_mg: 900 }), 60);

    expect(result.dosePorTomadaMg).toBe(900);
    expect(result.limitadoPelaDoseMaxima).toBe(false);
  });

  it("dose abaixo do limite permanece igual à calculada", () => {
    const result = calc(makeMedication({ dose_max_tomada_mg: 1000, dose_max_dia_mg: 4000 }), 12.5);

    expect(result.dosePorTomadaMg).toBeCloseTo(187.5);
    expect(result.limitadoPelaDoseMaxima).toBe(false);
  });

  it.each([0, -100, undefined])("limite inválido (%s) é ignorado", (limite) => {
    const medication = makeMedication({
      dose_max_tomada_mg: limite as number | null,
      dose_max_dia_mg: limite as number | null
    });

    expect(calc(medication, 80).limitadoPelaDoseMaxima).toBe(false);
  });
});

describe("calculateDose: conversão para gotas", () => {
  function drops(medication: Medication, weightKg: number, duration = ""): DoseCalculation {
    const result = calculateDose(medication, weightKg, duration, "gotas");
    if (result.status !== "ok") {
      throw new Error("Esperava cálculo ok");
    }
    return result.calculation;
  }

  it("dipirona 500 mg/mL a 20 gotas/mL: 14 kg → 210 mg = 0,42 mL = 8 gotas", () => {
    const result = drops(makeMedication({ gotas_por_ml: 20 }), 14, "3");

    expect(result.gotasPorTomadaExatas).toBeCloseTo(8.4);
    expect(result.gotasPorTomada).toBe(8);
    expect(result.unidadeAplicada).toBe("gotas");
    expect(result.gotasFatorPadrao).toBe(false);
    expect(result.prescriptionText).toContain(
      "Dar 8 gotas por via oral de 6 em 6 horas por 3 dias."
    );
  });

  it("arredonda para o inteiro mais próximo (7,5 → 8)", () => {
    expect(drops(makeMedication({ gotas_por_ml: 20 }), 12.5).gotasPorTomada).toBe(8);
  });

  it("usa o fator de gotas/mL do medicamento (10 gotas/mL)", () => {
    const result = drops(makeMedication({ gotas_por_ml: 10 }), 14);

    expect(result.gotasPorMl).toBe(10);
    expect(result.gotasPorTomada).toBe(4);
  });

  it("sem fator cadastrado usa 20 gotas/mL e sinaliza que é o padrão", () => {
    const result = drops(makeMedication({ gotas_por_ml: null }), 14);

    expect(result.gotasPorMl).toBe(20);
    expect(result.gotasFatorPadrao).toBe(true);
  });

  it("dose limitada à máxima arredonda para baixo, nunca acima do teto", () => {
    const medication = makeMedication({ gotas_por_ml: 20, dose_max_tomada_mg: 990 });
    const result = drops(medication, 80);

    expect(result.gotasPorTomadaExatas).toBeCloseTo(39.6);
    expect(result.gotasPorTomada).toBe(39);
    expect((result.gotasPorTomada as number) * (500 / 20)).toBeLessThanOrEqual(990);
  });

  it("dose menor que 1 gota mantém a receita em mL", () => {
    const result = drops(makeMedication({ gotas_por_ml: 20 }), 0.5);

    expect(result.gotasPorTomada).toBeNull();
    expect(result.unidadeAplicada).toBe("mL");
    expect(result.prescriptionText).toContain("Dar 0,02 mL");
  });

  it("1 gota usa o singular", () => {
    const result = drops(makeMedication({ gotas_por_ml: 20 }), 1.67);

    expect(result.gotasPorTomada).toBe(1);
    expect(result.prescriptionText).toContain("Dar 1 gota por");
  });

  it("em mL a receita não muda, mesmo com fator de gotas cadastrado", () => {
    const result = calc(makeMedication({ gotas_por_ml: 20 }), 14);

    expect(result.unidadeAplicada).toBe("mL");
    expect(result.prescriptionText).toContain("Dar 0,42 mL");
  });
});

describe("concentrationMgPerMl", () => {
  it.each<[number, string, number]>([
    [500, "mg/mL", 500],
    [500, "mg/ml", 500],
    [250, "mg/5 mL", 50],
    [250, "mg/5mL", 50],
    [250, " mg / 5 mL ", 50],
    [250, "MG/5 ML", 50],
    [100, "mg/2,5 mL", 40],
    [100, "mg/2.5 mL", 40],
    [100, "mcg/mL", 0.1],
    [100, "µg/mL", 0.1],
    [1, "g/mL", 1000]
  ])("%s %s = %s mg/mL", (valor, unidade, esperado) => {
    expect(concentrationMgPerMl(valor, unidade)).toBeCloseTo(esperado);
  });

  it.each<[number, string]>([
    [100, "UI/mL"],
    [100, "mg/gota"],
    [100, "mg/0 mL"],
    [0, "mg/mL"],
    [-5, "mg/mL"]
  ])("%s %s é inválido", (valor, unidade) => {
    expect(concentrationMgPerMl(valor, unidade)).toBeNull();
  });
});

describe("frequencyText", () => {
  it.each<[number, string]>([
    [1, "1 vez ao dia"],
    [2, "de 12 em 12 horas"],
    [3, "de 8 em 8 horas"],
    [4, "de 6 em 6 horas"],
    [6, "de 4 em 4 horas"],
    [5, "5 vezes ao dia"],
    [7, "7 vezes ao dia"]
  ])("%s vezes/dia → '%s'", (vezes, esperado) => {
    expect(frequencyText(vezes)).toBe(esperado);
  });
});

describe("formatTreatmentDuration", () => {
  it.each<[string, string]>([
    ["", ""],
    ["   ", ""],
    ["7", "7 dias"],
    [" 10 ", "10 dias"],
    ["2,5", "2,5 dias"],
    ["7 dias", "7 dias"],
    ["até melhora", "até melhora"]
  ])("'%s' → '%s'", (entrada, esperado) => {
    expect(formatTreatmentDuration(entrada)).toBe(esperado);
  });
});
