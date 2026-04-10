import { useEffect, useMemo, useState } from "react";

function calculateTimeLeft(targetDate) {
  if (!targetDate) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalMs = Math.max(new Date(targetDate).getTime() - Date.now(), 0);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { totalMs, days, hours, minutes, seconds };
}

export default function CountdownTimer({ targetDate, onComplete, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));

    if (!targetDate) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const next = calculateTimeLeft(targetDate);
      setTimeLeft(next);

      if (next.totalMs <= 0) {
        window.clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onComplete, targetDate]);

  const segments = useMemo(
    () => [
      ["Days", timeLeft.days],
      ["Hours", timeLeft.hours],
      ["Minutes", timeLeft.minutes],
      ["Seconds", timeLeft.seconds]
    ],
    [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]
  );

  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
      {segments.map(([label, value]) => (
        <div
          key={label}
          className={`rounded-[1.6rem] border border-white/10 bg-white/6 backdrop-blur-xl ${
            compact ? "px-4 py-4" : "px-5 py-6"
          }`}
        >
          <div className={`${compact ? "text-3xl" : "text-4xl sm:text-5xl"} font-semibold text-white`}>
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.28em] text-white/45">{label}</div>
        </div>
      ))}
    </div>
  );
}
