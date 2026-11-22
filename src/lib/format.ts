export function formatTimer(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;

  return `${minutes.toString().padStart(2, "0")}:${rest
    .toString()
    .padStart(2, "0")}`;
}
