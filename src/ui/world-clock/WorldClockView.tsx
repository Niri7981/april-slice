type WorldClockViewProps = {
  dayLabel: string;
  timeLabel: string;
};

export function WorldClockView({ dayLabel, timeLabel }: WorldClockViewProps) {
  return (
    <div className="world-clock-view" aria-label={`${dayLabel}, ${timeLabel}`}>
      <span>{dayLabel}</span>
      <strong>{timeLabel}</strong>
    </div>
  );
}
