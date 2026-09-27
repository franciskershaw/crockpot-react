export function stopEvent(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}
