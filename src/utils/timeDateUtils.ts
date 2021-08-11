export const getTimeDurationString = (timeMs: number | undefined, showSeconds?: boolean): string => {
  if (timeMs === undefined) {
    return '--:--:--';
  }
  const duration: string[] = [];
  let remainder = 0;
  const hours = Math.floor(timeMs / 3_600_000);
  remainder = timeMs - hours * 3_600_000;
  duration.push(hours ? `${hours}` : '0');
  const mins = Math.floor(remainder/60_000);
  remainder = remainder - mins * 60_000;
  duration.push(mins ? `${mins.toString().padStart(2, '0')}` : '00');
  const secs = Math.floor(remainder/1_000);
  showSeconds && duration.push(secs ? `${secs.toString().padStart(2, '0')}` : '00');
  return duration.join(':');
}

export const getDateNoLaterThanNow = (date: Date): Date => {
  const timeToSet = new Date(date.valueOf());
      if (date.valueOf() > Date.now()) {
        timeToSet.setTime(date.valueOf() - 24*3_600_000);
      }
  return timeToSet;
}

export const getDateWithinLimit = (date: Date): Date => {
  const timeToSet = new Date(date.valueOf());
      if (date.valueOf() > Date.now()) {
        timeToSet.setTime(date.valueOf() - 24*3_600_000);
      }
  return timeToSet;
}