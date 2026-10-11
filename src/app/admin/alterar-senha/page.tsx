"use client";

import { useActionState } from "react";
import { changePassword } from "../actions";

const input =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none";

export default function ChangePasswordPage() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Alterar senha</h1>
          <p className="mt-1 text-sm text-slate-500">Defina uma nova senha para continuar.</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Senha atual
          <input name="current" type="password" autoComplete="current-password" required className={input} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Nova senha (mín. 8 caracteres)
          <input name="next" type="password" autoComplete="new-password" required minLength={8} className={input} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Confirmar nova senha
          <input name="confirm" type="password" autoComplete="new-password" required minLength={8} className={input} />
        </label>
        {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-md bg-[#7c8d5b] py-2.5 font-medium text-white hover:bg-[#6b7a4d] disabled:opacity-60">
          {pending ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </main>
  );
}
