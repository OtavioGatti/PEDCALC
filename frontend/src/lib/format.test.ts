import { describe, expect, it } from "vitest";
import { formatDecimal } from "./format";

describe("formatDecimal", () => {
  it.each<[number, number | undefined, string]>([
    [750, undefined, "750"],
    [187.5, undefined, "187,5"],
    [0.375, undefined, "0,38"],
    [1200, undefined, "1.200"],
    [2, undefined, "2"],
    [6, 0, "6"]
  ])("%s (máx %s casas) → '%s'", (valor, casas, esperado) => {
    expect(formatDecimal(valor, casas)).toBe(esperado);
  });
});
