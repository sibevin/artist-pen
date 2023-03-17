export type DurationHms = {
  hours: number;
  minutes: number;
  seconds: number;
};

const H_SIZE = 60 * 60;
const M_SIZE = 60;

export function getDurationHms(duration: number): DurationHms {
  let remainingDur = duration;
  const hours = Math.floor(duration / H_SIZE);
  remainingDur = remainingDur % H_SIZE;
  const minutes = Math.floor(remainingDur / M_SIZE);
  const seconds = Math.floor(remainingDur % M_SIZE);
  return { hours, minutes, seconds };
}

export function getDurationString(duration: number): string {
  const hmr = getDurationHms(duration);
  return `${String(hmr.hours).padStart(2, "0")}:${String(hmr.minutes).padStart(
    2,
    "0"
  )}:${String(hmr.seconds).padStart(2, "0")}`;
}
