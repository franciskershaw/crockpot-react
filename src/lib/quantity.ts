// The server stores NUMERIC(10, 2); 6 digits covers any real g/ml amount with room to spare.
const QUANTITY_PATTERN = /^\d{0,6}(\.\d{0,2})?$/;

export function isQuantityInput(value: string): boolean {
  return QUANTITY_PATTERN.test(value);
}

export function parseQuantity(value: string): number | null {
  const quantity = Number(value);
  return isQuantityInput(value) && quantity > 0 ? quantity : null;
}
