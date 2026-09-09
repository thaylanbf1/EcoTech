import { useEffect, useState } from "react";
import { getTimeLeft, type TimeLeft } from "../helpers/countdown";

interface CountdownProps {
  targetDate: string;
  variant?: "dark" | "light";
}


const Countdown = ({targetDate, variant = "dark"}: CountdownProps) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const items: { label: string; value: number }[] = [
    { label: "dias", value: timeLeft.dias },
    { label: "horas", value: timeLeft.horas },
    { label: "minutos", value: timeLeft.minutos },
    { label: "segundos", value: timeLeft.segundos },
  ];

  const isDark = variant === "dark";
  return (
    <div
      className={`flex items-center gap-3 rounded-full border px-6 py-4 ${
        isDark ? "border-eco-cream-light" : "border-eco-blue"
      }`}
    >
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center leading-none">
            <span
              className={`font-sora text-2xl font-bold ${
                isDark ? "text-white" : "text-eco-blue"
              }`}
            >
              {/* padStart garante "05" em vez de "5" */}
              {String(item.value).padStart(2, "0")}
            </span>
            <span
              className={`text-[11px] ${isDark ? "text-white/80" : "text-eco-blue/70"}`}
            >
              {item.label}
            </span>
          </div>
          {i < items.length - 1 && (
            <span className={isDark ? "text-white/40" : "text-eco-blue/30"}>|</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default Countdown
