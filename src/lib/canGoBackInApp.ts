// react-router increments window.history.state.idx on every push; idx > 0 means navigate(-1) has a real entry to land on.
export function canGoBackInApp(): boolean {
  return (window.history.state?.idx ?? 0) > 0;
}
