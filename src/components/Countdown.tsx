"use client";

import { useEffect, useState } from "react";

function parts(target: number, now: number) {
  const ms = Math.max(0, target - now);
  return {
    dias: Math.floor(ms / 86400000),
    horas: Math.floor((ms / 3600000) % 24),
    min: Math.floor((ms / 60000) % 60),
    seg: Math.floor((ms / 1000) % 60),
  };
}

const sameDay = (a: number, b: number) => {
  const f = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  return f(a) === f(b);
};

export default function Countdown({ eventAt }: { eventAt: string | null }) {
  const target = eventAt ? new Date(eventAt).getTime() : null;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (target === null) return null;

  // Antes da hidratação: evita divergência servidor/cliente
  if (now === null) return <div className="h-24" aria-hidden="true" />;

  if (sameDay(target, now)) {
    return <p className="font-script text-6xl" role="status">É hoje!</p>;
  }
  if (now > target) {
    return <p className="font-script text-4xl leading-tight sm:text-5xl" role="status">Nosso grande dia já aconteceu.</p>;
  }

  const t = parts(target, now);
  const items = [
    [t.dias, "dias"],
    [t.horas, "horas"],
    [t.min, "minutos"],
    [t.seg, "segundos"],
  ] as const;

  return (
    <div role="timer" aria-label={`Faltam ${t.dias} dias`} className="w-full">
      <p className="mb-4 font-caps text-xs tracking-[0.3em] uppercase text-amber-200/95 font-medium drop-shadow sm:text-sm">
        Faltam {t.dias} {t.dias === 1 ? "dia" : "dias"}...
      </p>
      <div className="flex justify-center gap-4 sm:gap-8 drop-shadow-md">
        {items.map(([v, l]) => (
          <div key={l} className="min-w-14 text-center sm:min-w-20">
            <div className="font-caps text-4xl sm:text-6xl text-white font-normal drop-shadow-lg">
              {String(v).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[0.65rem] tracking-[0.25em] uppercase text-white/90 drop-shadow sm:text-xs font-medium">
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
