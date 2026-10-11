"use client";

import { useActionState, useState } from "react";
import { CHILD_AGE_NOTICE } from "@/lib/rules";
import { submitRsvp } from "./actions";

type Props = {
  weddingSlug: string;
  inviteSlug: string;
  type: string;
  max: number;
  initial: { status: string; adults: number; children: number } | null;
  intro: string;
};

function Stepper({ label, value, onChange, max, id }: { label: string; value: number; onChange: (n: number) => void; max: number; id: string }) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#47582e] text-xl font-bold text-[#47582e] transition hover:bg-[#47582e] hover:text-white focus-visible:ring-2 focus-visible:ring-[#47582e] focus-visible:outline-none disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-[#47582e]";
  return (
    <div className="flex items-center justify-between gap-4">
      <span id={id} className="font-caps text-sm tracking-wide text-[#2C221A] font-semibold">{label}</span>
      <div className="flex items-center gap-4" role="group" aria-labelledby={id}>
        <button type="button" aria-label={`Diminuir ${label}`} className={btn} disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
        <output className="w-8 text-center text-xl font-bold text-[#2C221A]" aria-live="polite">{value}</output>
        <button type="button" aria-label={`Aumentar ${label}`} className={btn} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

export default function RsvpForm({ weddingSlug, inviteSlug, type, max, initial, intro }: Props) {
  const [state, action, pending] = useActionState(submitRsvp, undefined);
  const [editing, setEditing] = useState(!initial);
  const [choice, setChoice] = useState<"CONFIRMED" | "DECLINED" | null>(
    initial ? (initial.status as "CONFIRMED" | "DECLINED") : null,
  );
  const [adults, setAdults] = useState(initial?.adults ?? (max === 1 ? 1 : 0));
  const [children, setChildren] = useState(initial?.children ?? 0);

  const current = state?.ok
    ? { status: state.ok, adults, children }
    : initial;
  const total = adults + children;
  const remaining = max - total;

  if (current && !editing) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-stone-200/80 bg-white/90 p-8 shadow-xs text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7c8d5b]/12 text-[#47582e]">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {state?.ok && (
          <p role="status" className="mb-3 font-script text-4xl text-[#47582e] sm:text-5xl">
            {state.ok === "DECLINED" ? "Resposta registrada." : state.updated ? "Presença atualizada!" : "Presença confirmada!"}
          </p>
        )}
        <p className="text-base text-[#2C221A] sm:text-lg">
          {current.status === "CONFIRMED"
            ? `Você confirmou presença: ${current.adults} ${current.adults === 1 ? "adulto" : "adultos"}${current.children ? ` e ${current.children} ${current.children === 1 ? "criança" : "crianças"}` : ""}.`
            : "Você informou que não poderá comparecer."}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="mt-6 rounded-full border-2 border-[#47582e] px-7 py-3 font-caps text-xs tracking-widest text-[#47582e] font-semibold transition hover:bg-[#47582e] hover:text-white"
        >
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="mx-auto max-w-lg rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-xs text-left sm:p-8">
      <input type="hidden" name="weddingSlug" value={weddingSlug} />
      <input type="hidden" name="inviteSlug" value={inviteSlug} />
      <input type="hidden" name="status" value={choice ?? ""} />
      <input type="hidden" name="adults" value={choice === "CONFIRMED" ? adults : 0} />
      <input type="hidden" name="children" value={choice === "CONFIRMED" ? children : 0} />

      {intro && <p className="mb-5 text-center text-sm sm:text-base leading-relaxed text-[#5E4E41]">{intro}</p>}
      {type === "PLUS_ONE" && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-center text-xs font-semibold text-amber-900">
          Gostaríamos de convidar você e mais um acompanhante.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {([
          ["CONFIRMED", "Confirmo presença"],
          ["DECLINED", "Não poderei comparecer"],
        ] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={choice === v}
            onClick={() => setChoice(v)}
            className={`min-h-14 rounded-2xl border-2 px-3 py-3 text-xs sm:text-sm font-bold tracking-wide transition focus-visible:ring-2 focus-visible:ring-[#47582e] focus-visible:outline-none ${
              choice === v
                ? v === "CONFIRMED"
                  ? "border-[#47582e] bg-[#47582e] text-white shadow-xs"
                  : "border-[#c97972] bg-[#c97972] text-white shadow-xs"
                : "border-stone-300 bg-white text-[#2C221A] hover:border-stone-400"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {choice === "CONFIRMED" && (
        <div className="mt-6 space-y-5 rounded-2xl border border-stone-200/80 bg-[#FAF7F2] p-5 shadow-2xs sm:p-6">
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 text-xs text-amber-900 leading-relaxed">
            {CHILD_AGE_NOTICE}
          </div>
          <Stepper id="lbl-adults" label="Adultos" value={adults} max={adults + Math.max(0, remaining)} onChange={setAdults} />
          <Stepper id="lbl-children" label="Crianças" value={children} max={children + Math.max(0, remaining)} onChange={setChildren} />
          <div className="border-t border-stone-200 pt-3 text-center text-xs sm:text-sm text-[#5E4E41]">
            Total: <strong className="text-[#2C221A]">{total}</strong> de {max} {max === 1 ? "pessoa permitida" : "pessoas permitidas"}
          </div>
        </div>
      )}

      {state?.error && <p role="alert" className="mt-4 text-center text-sm font-bold text-red-700">{state.error}</p>}

      <button
        disabled={pending || !choice || (choice === "CONFIRMED" && total < 1)}
        className="mt-6 min-h-14 w-full rounded-full bg-[#47582e] px-6 py-3.5 font-caps text-xs tracking-widest text-white shadow-md transition-all hover:bg-[#394725] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#47582e] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
      >
        {pending ? "Enviando..." : initial ? "Atualizar resposta" : "Enviar resposta"}
      </button>
      {initial && (
        <button type="button" onClick={() => setEditing(false)} className="mt-3.5 w-full text-center text-xs font-semibold text-[#5E4E41] hover:text-[#2C221A] underline">
          Cancelar
        </button>
      )}
    </form>
  );
}
