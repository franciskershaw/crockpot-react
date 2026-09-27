export function focusAtEnd(input: HTMLInputElement | null) {
  if (!input) return;
  input.focus({ preventScroll: true });
  input.setSelectionRange(input.value.length, input.value.length);
}
