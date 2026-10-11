"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { TYPE_LABEL, INVITATION_TYPES, type InvitationType } from "@/lib/rules";
import type { FormState } from "./actions";

type Initial = {
  id?: string;
  type: InvitationType;
  displayName: string;
  maxGuests: number;
  favorCount: number;
};

const field =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none";

export default function InviteForm({
  action,
  initial,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  initial?: Initial;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<InvitationType>(initial?.type ?? "INDIVIDUAL");
  const [hasFavor, setHasFavor] = useState((initial?.favorCount ?? 0) > 0);

  return (
    <form action={formAction} className="max-w-xl space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <label className="block text-sm font-medium text-slate-700">
        Tipo de convite
        <select name="type" value={type} onChange={(e) => setType(e.target.value as InvitationType)} className={field}>
          {INVITATION_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Nome que aparecerá no convite
        <input
          name="displayName"
          required
          maxLength={80}
          defaultValue={initial?.displayName}
          placeholder={type === "COUPLE" ? "João e Maria" : type === "FAMILY" ? "João, Maria e família" : "João"}
          className={field}
        />
      </label>

      {type === "FAMILY" ? (
        <label className="block text-sm font-medium text-slate-700">
          Quantidade máxima de pessoas
          <input name="maxGuests" type="number" min={1} max={30} required defaultValue={initial?.type === "FAMILY" ? initial.maxGuests : 5} className={field} />
        </label>
      ) : (
        <p className="text-sm text-slate-500">Limite: {type === "INDIVIDUAL" ? "1 pessoa" : "2 pessoas"}.</p>
      )}

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" name="hasFavor" checked={hasFavor} onChange={(e) => setHasFavor(e.target.checked)} className="h-4 w-4" />
          Este convite tem lembrancinha
        </label>
        {hasFavor && (
          <label className="block text-sm font-medium text-slate-700">
            Quantidade de lembrancinhas
            <input name="favorCount" type="number" min={1} max={30} required defaultValue={initial?.favorCount || 1} className={field} />
          </label>
        )}
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <button disabled={pending} className="rounded-md bg-[#7c8d5b] px-5 py-2.5 font-medium text-white hover:bg-[#6b7a4d] disabled:opacity-60">
          {pending ? "Salvando..." : initial?.id ? "Salvar alterações" : "Criar convite"}
        </button>
        <Link href="/admin/convites" className="rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
