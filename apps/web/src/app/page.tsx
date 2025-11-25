"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
};

export default function Home() {
  const targetDate = new Date("2026-2-1");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = (): TimeLeft => {
      const difference = targetDate.getTime() - Date.now();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="`bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] absolute inset-0 from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[14px_24px] opacity-20" />

      <div className="relative z-10 w-full max-w-4xl space-y-16 text-center">
        <div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-1000">
          <h1 className="fade-in slide-in-from-bottom-8 animate-in bg-linear-to-r from-primary via-primary to-primary bg-clip-text font-bold text-6xl text-transparent delay-150 duration-1000 md:text-8xl">
            Showly
          </h1>
          <p className="fade-in slide-in-from-bottom-4 animate-in text-foreground/70 text-lg delay-300 duration-1000 md:text-xl">
            Something amazing is coming
          </p>
        </div>

        <div className="fade-in slide-in-from-bottom-4 animate-in delay-500 duration-1000">
          <div className="flex flex-wrap justify-center gap-6 font-bold text-5xl tabular-nums md:text-7xl">
            <span className="flex items-baseline gap-4 text-primary">
              <NumberFlow value={timeLeft.days} />
              <span className="text-3xl text-foreground/50 md:text-5xl">
                days
              </span>
            </span>
            <span className="flex items-baseline gap-4 text-primary">
              <NumberFlow value={timeLeft.hours} />
              <span className="text-3xl text-foreground/50 md:text-5xl">
                hours
              </span>
            </span>
            <span className="flex items-baseline gap-4 text-primary">
              <NumberFlow value={timeLeft.minutes} />
              <span className="text-3xl text-foreground/50 md:text-5xl">
                minutes
              </span>
            </span>
          </div>
        </div>

        <div className="fade-in slide-in-from-bottom-4 animate-in delay-700 duration-1000">
          <p className="text-foreground/50 text-sm md:text-base">
            Launching{" "}
            {targetDate.toLocaleDateString([], {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
