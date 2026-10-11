"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Área dos noivos</h1>
          <p className="mt-1 text-sm text-slate-500">Entre para administrar o casamento.</p>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Usuário
          <input name="username" autoComplete="username" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Senha
          <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none" />
        </label>
        {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="w-full rounded-md bg-[#7c8d5b] py-2.5 font-medium text-white hover:bg-[#6b7a4d] disabled:opacity-60">
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
