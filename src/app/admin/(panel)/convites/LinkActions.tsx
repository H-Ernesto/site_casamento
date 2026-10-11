"use client";

import { useState } from "react";

export default function LinkActions({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}${path}`;

  async function copy() {
    await navigator.clipboard.writeText(url());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Convite de casamento: ${title}`, url: url() });
      } catch {
        /* usuário cancelou */
      }
    } else {
      await copy();
    }
  }

  const btn = "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50";
  return (
    <>
      <button type="button" onClick={copy} className={btn}>{copied ? "Link copiado!" : "Copiar link"}</button>
      <button type="button" onClick={share} className={btn}>Compartilhar</button>
    </>
  );
}
