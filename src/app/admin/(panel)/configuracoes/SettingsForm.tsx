"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { updateWeddingSettings } from "./actions";

type SettingsData = {
  groomName: string;
  brideName: string;
  dateStr: string;
  timeStr: string;
  venueName: string;
  address: string;
  mapsUrl: string;
  dressCode: string;
  welcomeMessage: string;
  story: string;
  rsvpMessage: string;
  finalMessage: string;
  pixKey: string;
  heroPhotoUrl: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#7c8d5b] focus:ring-2 focus:ring-[#7c8d5b]/30 focus:outline-none";

export default function SettingsForm({ initial }: { initial: SettingsData }) {
  const [state, action, pending] = useActionState(updateWeddingSettings, undefined);
  const [heroPreview, setHeroPreview] = useState(initial.heroPhotoUrl);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setHeroPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form action={action} className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {state?.error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Configurações salvas com sucesso! As alterações já estão visíveis nos convites.
        </div>
      )}

      {/* Noivos */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Os Noivos
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">Nome do noivo</label>
            <input name="groomName" required defaultValue={initial.groomName} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Nome da noiva</label>
            <input name="brideName" required defaultValue={initial.brideName} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Data e Horário */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Data e Horário
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">Data do casamento</label>
            <input name="date" type="date" defaultValue={initial.dateStr} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Horário</label>
            <input name="time" type="time" defaultValue={initial.timeStr} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Local e Informações */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Local e Cerimônia
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">Nome do local</label>
            <input
              name="venueName"
              placeholder="Ex: Espaço Jardim das Palmeiras"
              defaultValue={initial.venueName}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Endereço textual</label>
            <input
              name="address"
              placeholder="Ex: Rodovia SP-332, Km 140 - Cosmópolis, SP"
              defaultValue={initial.address}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Link do Google Maps</label>
            <input
              name="mapsUrl"
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              defaultValue={initial.mapsUrl}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Dress code</label>
            <input
              name="dressCode"
              placeholder="Ex: Traje Social Completo / Passeio Completo"
              defaultValue={initial.dressCode}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Textos do Convite */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Mensagens e História
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Mensagem inicial (aparece logo após a abertura, antes da história)
            </label>
            <textarea
              name="welcomeMessage"
              rows={4}
              defaultValue={initial.welcomeMessage}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Nossa história</label>
            <textarea
              name="story"
              rows={5}
              defaultValue={initial.story}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Mensagem de confirmação (instruções do RSVP)
            </label>
            <input
              name="rsvpMessage"
              defaultValue={initial.rsvpMessage}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Mensagem final</label>
            <input
              name="finalMessage"
              placeholder="Ex: Com carinho, ou Esperamos por você!"
              defaultValue={initial.finalMessage}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Pix */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Chave Pix
        </h2>
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-700">Chave Pix dos noivos</label>
          <input
            name="pixKey"
            placeholder="Ex: email@exemplo.com ou chave aleatória"
            defaultValue={initial.pixKey}
            className={inputClass}
          />
        </div>
      </div>

      {/* Foto Principal (Hero) */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Foto Principal do Convite
        </h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          {heroPreview && (
            <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <Image
                src={heroPreview}
                alt="Foto principal"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="hidden"
              name="currentHeroPhotoUrl"
              value={initial.heroPhotoUrl}
            />
            <label className="block text-xs font-medium text-slate-700">
              Alterar foto principal (arquivo de imagem)
            </label>
            <input
              type="file"
              name="heroPhoto"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#7c8d5b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#6b7a4d]"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#7c8d5b] px-6 py-3 font-caps text-xs tracking-widest text-white shadow transition hover:bg-[#6b7a4d] disabled:opacity-50"
        >
          {pending ? "Salvando alterações..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
