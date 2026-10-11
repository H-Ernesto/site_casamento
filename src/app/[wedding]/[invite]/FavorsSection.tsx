"use client";

import { useState, useTransition } from "react";
import { submitFavorAnswers } from "./actions";

type FavorQuestion = {
  id: string;
  label: string;
  options: string[];
};

type FavorItem = {
  id: string;
  name: string;
  questions: FavorQuestion[];
};

type SavedAnswer = {
  questionId: string;
  itemIndex: number;
  value: string;
};

type Props = {
  weddingSlug: string;
  inviteSlug: string;
  favorCount: number;
  favors: FavorItem[];
  savedAnswers: SavedAnswer[];
};

export default function FavorsSection({
  weddingSlug,
  inviteSlug,
  favorCount,
  favors,
  savedAnswers,
}: Props) {
  // Mapa de estado: `${questionId}_${itemIndex}` -> value
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const ans of savedAnswers) {
      initial[`${ans.questionId}_${ans.itemIndex}`] = ans.value;
    }
    return initial;
  });

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (favorCount <= 0 || favors.length === 0) {
    return null;
  }

  const items = Array.from({ length: favorCount }, (_, idx) => idx + 1);

  function handleChange(questionId: string, itemIndex: number, val: string) {
    setFormValues((prev) => ({
      ...prev,
      [`${questionId}_${itemIndex}`]: val,
    }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = Object.entries(formValues).map(([key, value]) => {
      const [questionId, itemIndexStr] = key.split("_");
      return {
        questionId,
        itemIndex: Number(itemIndexStr),
        value,
      };
    });

    startTransition(async () => {
      const res = await submitFavorAnswers(weddingSlug, inviteSlug, payload);
      if (res?.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl text-left">
      <div className="space-y-6">
        {favors.map((favor) => (
          <div key={favor.id} className="rounded-3xl border border-stone-200/80 bg-white/90 p-6 sm:p-8 shadow-xs">
            <h3 className="font-caps text-xl font-bold tracking-wide text-[#2C221A]">{favor.name}</h3>
            <p className="mt-1.5 text-sm text-[#5E4E41]">
              Você tem direito a {favorCount} {favorCount === 1 ? "lembrancinha" : "lembrancinhas"}. Por favor, informe as preferências abaixo:
            </p>

            <div className="mt-6 space-y-6">
              {items.map((itemNum) => (
                <div key={itemNum} className="rounded-2xl border border-stone-200/80 bg-[#FAF7F2] p-5 shadow-2xs">
                  <p className="font-caps text-xs tracking-wider text-[#47582e] uppercase font-bold">
                    {favorCount > 1 ? `Opção ${itemNum}` : "Sua preferência"}
                  </p>
                  <div className="mt-3.5 space-y-4">
                    {favor.questions.map((q) => {
                      const fieldKey = `${q.id}_${itemNum}`;
                      const val = formValues[fieldKey] ?? "";

                      return (
                        <div key={q.id}>
                          <label className="block text-sm font-semibold text-[#2C221A]">
                            {q.label}
                          </label>
                          {q.options.length > 0 ? (
                            <select
                              value={val}
                              required
                              onChange={(e) => handleChange(q.id, itemNum, e.target.value)}
                              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-[#2C221A] focus:border-[#47582e] focus:ring-2 focus:ring-[#7c8d5b]/25 focus:outline-none shadow-2xs transition"
                            >
                              <option value="">Selecione uma opção...</option>
                              {q.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={val}
                              required
                              placeholder="Digite sua resposta..."
                              onChange={(e) => handleChange(q.id, itemNum, e.target.value)}
                              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-[#2C221A] focus:border-[#47582e] focus:ring-2 focus:ring-[#7c8d5b]/25 focus:outline-none shadow-2xs transition"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {saved && (
        <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-center font-caps text-xs tracking-widest text-emerald-800 font-bold">
          Respostas salvas com sucesso!
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 min-h-12 w-full rounded-full bg-[#47582e] px-6 py-3.5 font-caps text-xs tracking-widest text-white shadow-md transition-all hover:bg-[#394725] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47582e] disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar informações das lembrancinhas"}
      </button>
    </form>
  );
}
