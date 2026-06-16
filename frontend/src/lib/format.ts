export function formatDecimal(value: number, maxFractionDigits = 2) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1
  }).format(value);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
