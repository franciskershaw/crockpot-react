// The server checks text length with Go's len(), which counts bytes.
export const byteLength = (value: string) =>
  new TextEncoder().encode(value).length;
