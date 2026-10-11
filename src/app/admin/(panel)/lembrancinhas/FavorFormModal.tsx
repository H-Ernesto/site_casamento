"use client";

import { useActionState, useState } from "react";
import { saveFavor, type FormState } from "./actions";

type Question = {
  id?: string;
  label: string;
  options: string;
};

type Favor = {
  id: string;
  name: string;
  questions: Question[];
};

export default function FavorFormModal({
  favor,
  onClose,
}: {
  favor?: Favor | null;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (favor && favor.questions.length > 0) {
      return favor.questions.map((q) => ({
        id: q.id,
        label: q.label,
        options: q.options || "",
      }));
    }
    return [{ label: "Qual o tamanho da sua camisa?", options: "P|M|G|GG" }];
  });

  const [state, action, pending] = useActionState(async (s: FormState, f: FormData) => {
    const res = await saveFavor(s, f);
    if (res?.success) {
      onClose();
    }
    return res;
  }, undefined);

  function addQuestion() {
    setQuestions((prev) => [...prev, { label: "", options: "" }]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: "label" | "options", val: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: val } : q))
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-900">
          {favor ? "Editar lembrancinha" : "Nova lembrancinha"}
        </h2>

        <form action={action} className="mt-5 space-y-5">
          {favor && <input type="hidden" name="id" value={favor.id} />}
          <input
            type="hidden"
            name="questionsJson"
            value={JSON.stringify(questions)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nome da lembrancinha (ex: Camisa personalizada, Chinelos, etc.)
            </label>
            <input
              name="name"
              required
              defaultValue={favor?.name}
              placeholder="Ex: Camisas do Casamento"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">
                Perguntas personalizadas
              </label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs font-semibold text-[#7c8d5b] hover:underline"
              >
                + Adicionar pergunta
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Cada convidado responderá a essas perguntas para cada lembrancinha que tiver direito.
            </p>

            <div className="mt-4 space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Pergunta {idx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Texto da pergunta
                      </label>
                      <input
                        type="text"
                        required
                        value={q.label}
                        placeholder="Ex: Qual o tamanho da sua camisa?"
                        onChange={(e) => updateQuestion(idx, "label", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600">
                        Opções de resposta (separadas por barra vertical &apos;|&apos;)
                      </label>
                      <input
                        type="text"
                        value={q.options}
                        placeholder="Ex: P|M|G|GG (deixe vazio para texto livre)"
                        onChange={(e) => updateQuestion(idx, "options", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
                      />
                      <span className="text-[0.65rem] text-slate-500">
                        Se vazio, o convidado poderá digitar qualquer resposta livremente.
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {state?.error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[#7c8d5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b7a4d] disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar lembrancinha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
