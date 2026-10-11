"use client";

import { useActionState } from "react";
import { saveGift, type FormState } from "./actions";

type Gift = {
  id: string;
  name: string;
  priceCents: number;
  url: string;
  imageUrl?: string;
};

export default function GiftFormModal({ gift, onClose }: { gift?: Gift | null; onClose: () => void }) {
  const [state, action, pending] = useActionState(async (s: FormState, f: FormData) => {
    const res = await saveGift(s, f);
    if (res?.success) {
      onClose();
    }
    return res;
  }, undefined);

  const initialPrice = gift ? (gift.priceCents / 100).toFixed(2).replace(".", ",") : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-900">
          {gift ? "Editar presente" : "Novo presente"}
        </h2>

        <form action={action} className="mt-5 space-y-4">
          {gift && <input type="hidden" name="id" value={gift.id} />}

          <div>
            <label className="block text-sm font-medium text-slate-700">Nome do presente</label>
            <input
              name="name"
              required
              defaultValue={gift?.name}
              placeholder="Ex: Air Fryer"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Valor (R$)</label>
            <input
              name="price"
              required
              defaultValue={initialPrice}
              placeholder="Ex: 350,00"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">URL da Imagem do presente</label>
            <input
              name="imageUrl"
              type="url"
              defaultValue={gift?.imageUrl}
              placeholder="https://... (link da foto do produto)"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
            />
            <p className="mt-1 text-[0.7rem] text-slate-500">
              Cole o link direto de uma imagem para ilustrar o presente no convite.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Link externo para compra (opcional)</label>
            <input
              name="url"
              type="url"
              defaultValue={gift?.url}
              placeholder="https://... (ex: link na Amazon, Magalu, etc.)"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none"
            />
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
              {pending ? "Salvando..." : "Salvar presente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
