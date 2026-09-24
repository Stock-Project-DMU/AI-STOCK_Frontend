export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .replace("T", " ")
    .replace(/(\d{2}:\d{2}:\d{2})\.\d+/, "$1")
    .replace(/Z$/, "");
}

