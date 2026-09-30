// Marker must be followed by whitespace or end of line, so "1.5 litres" keeps its number.
const LEADING_NUMBERING = /^(?:step\s*\d+\s*[:.)\-–]?|\d+[.)])(?:\s+|$)/i;

export function parseSteps(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(LEADING_NUMBERING, "").trim())
    .filter((line) => line !== "");
}
