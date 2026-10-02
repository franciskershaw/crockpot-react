export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-[13px] text-rust-text">{message}</p>;
}
