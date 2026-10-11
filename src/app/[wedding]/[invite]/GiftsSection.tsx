"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { selectGift } from "./actions";

type GiftItem = {
  id: string;
  name: string;
  priceCents: number;
  url: string;
  imageUrl?: string;
  selectedCount: number;
};

type Props = {
  weddingSlug: string;
  inviteSlug: string;
  gifts: GiftItem[];
  pixKey: string;
};


function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12 text-[#7c8d5b]/60" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-8.25M21 11.25H3M21 11.25h-18M12 4.5v16.5M7.5 4.5a3 3 0 0 1 6 0 3 3 0 0 1 6 0c0 1.657-1.343 3-3 3H7.5c-1.657 0-3-1.343-3-3a3 3 0 0 1 3-3z" />
    </svg>
  );
}

export default function GiftsSection({ weddingSlug, inviteSlug, gifts, pixKey }: Props) {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmingPurchase, setConfirmingPurchase] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedGift(null);
        setPixModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function copyPix() {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }

  function handleConfirmBought() {
    if (!selectedGift) return;
    startTransition(async () => {
      const res = await selectGift(selectedGift.id, weddingSlug, inviteSlug);
      if (res?.ok) {
        setConfirmingPurchase(false);
        setSuccessMessage("Presente registrado com sucesso! Muito obrigado pelo carinho! ❤️");
        // atualiza contagem local para feedback instantâneo
        setSelectedGift((prev) => (prev ? { ...prev, selectedCount: prev.selectedCount + 1 } : null));
        setTimeout(() => {
          setSuccessMessage(null);
          setSelectedGift(null);
        }, 3000);
      }
    });
  }

  return (
    <div>
      {/* Grid de Presentes Responsivo (sempre em grade em qualquer tela) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {gifts.map((g) => {
          const isBought = g.selectedCount > 0;
          const formattedPrice = (g.priceCents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });

          return (
            <div
              key={g.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedGift(g);
                setConfirmingPurchase(false);
                setSuccessMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedGift(g);
                }
              }}
              className={`group relative flex cursor-pointer flex-col justify-between overflow-visible rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] ${
                isBought
                  ? "border-[#7c8d5b]/40 bg-[#F2F6ED] shadow-xs"
                  : "border-stone-200/90 bg-white shadow-xs hover:border-[#7c8d5b]/60"
              }`}
            >
              {/* Bolinha verde com o número comprado no canto superior direito */}
              {isBought && (
                <div
                  title={`${g.selectedCount} unidade(s) escolhida(s)`}
                  className="absolute -top-2.5 -right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#47582e] text-xs font-bold text-white shadow-md ring-2 ring-[#FAF7F2]"
                >
                  {g.selectedCount}
                </div>
              )}

              {/* Imagem do presente */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 flex items-center justify-center">
                {g.imageUrl ? (
                  <Image
                    src={g.imageUrl}
                    alt={g.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <GiftIcon />
                )}
                {isBought && <div className="absolute inset-0 bg-[#47582e]/10" />}
              </div>

              {/* Textos */}
              <div className="mt-3 flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="line-clamp-2 font-caps text-xs font-semibold tracking-wide text-[#2C221A] sm:text-sm">
                    {g.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[#47582e] sm:text-base">
                    {formattedPrice}
                  </p>
                </div>
                <div className="mt-3">
                  <span className="inline-block w-full rounded-lg bg-[#7c8d5b]/12 py-1.5 text-center font-caps text-[0.65rem] tracking-wider text-[#47582e] font-semibold transition group-hover:bg-[#47582e] group-hover:text-white sm:text-xs">
                    Ver detalhes
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Card do Pix Avulso no mesmo Grid com o mesmo formato */}
        {pixKey && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setPixModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setPixModalOpen(true);
            }}
            className="group relative flex cursor-pointer flex-col justify-between overflow-visible rounded-2xl border border-amber-300/80 bg-white p-3 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {/* Ícone/Logo visual do Pix */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#32BCAD]/12 via-amber-100/30 to-[#7c8d5b]/12 flex flex-col items-center justify-center p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs sm:h-20 sm:w-20 p-2.5">
                <Image
                  src="/images/pix.svg"
                  alt="Pix"
                  width={56}
                  height={56}
                  className="h-9 w-9 sm:h-12 sm:w-12 object-contain"
                />
              </div>
              <span className="mt-2 text-[0.65rem] font-bold tracking-widest text-[#249588] uppercase sm:text-xs">
                PIX OFICIAL
              </span>
            </div>

            <div className="mt-3 flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-caps text-xs font-semibold tracking-wide text-[#2C221A] sm:text-sm">
                  Pix Avulso
                </h3>
                <p className="mt-1 text-xs text-[#5E4E41]">
                  Contribua com o valor que desejar
                </p>
              </div>
              <div className="mt-3">
                <span className="inline-block w-full rounded-lg bg-[#d9753e] py-1.5 text-center font-caps text-[0.65rem] tracking-wider text-white font-semibold transition group-hover:bg-[#c2622e] sm:text-xs">
                  Ver chave Pix
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão Centralizado para Lista de Presentes da Havan */}
      <div className="mt-10 flex flex-col items-center justify-center text-center sm:mt-12">
        <a
          href="https://lista.havan.com.br/Convidado/ItensListaPresente/965780"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#1E3A5F] px-8 py-3.5 font-caps text-xs tracking-widest text-white shadow-md transition-all duration-300 hover:bg-[#152A47] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]"
        >
          <span>IR PARA LISTA DE PRESENTES DA HAVAN</span>
          <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Modal de Detalhes do Presente */}
      {selectedGift && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGift(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#FAF7F2] p-6 text-center text-[#2C221A] shadow-2xl border border-stone-200/90 sm:p-8">
            {/* Botão Fechar em Alto Contraste */}
            <button
              type="button"
              onClick={() => setSelectedGift(null)}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2C221A] shadow-sm border border-stone-200 transition duration-200 hover:bg-[#47582e] hover:text-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47582e]"
              aria-label="Fechar janela"
              title="Fechar janela (ESC)"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Imagem do presente */}
            <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl bg-white shadow-xs border border-stone-200/60 flex items-center justify-center">
              {selectedGift.imageUrl ? (
                <Image
                  src={selectedGift.imageUrl}
                  alt={selectedGift.name}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <GiftIcon />
              )}
            </div>

            <div className="mt-5">
              <h3 className="font-caps text-lg font-bold tracking-wide text-[#2C221A] sm:text-xl">
                {selectedGift.name}
              </h3>
              <p className="mt-1 text-2xl font-bold text-[#47582e]">
                {(selectedGift.priceCents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              {selectedGift.selectedCount > 0 && (
                <p className="mt-1 text-xs font-semibold text-[#d9753e]">
                  {selectedGift.selectedCount}{" "}
                  {selectedGift.selectedCount === 1 ? "unidade já escolhida" : "unidades já escolhidas"}
                </p>
              )}
            </div>

            {/* Bloco do Pix com valor específico */}
            {pixKey && (
              <div className="mt-5 rounded-2xl border border-stone-200/90 bg-white p-4 text-left shadow-xs">
                <div className="flex items-center gap-2">
                  <Image src="/images/pix.svg" alt="Pix" width={18} height={18} className="h-4 w-4 object-contain" />
                  <p className="text-xs font-semibold text-[#2C221A]">
                    Presentear via Pix com este valor:
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5">
                  <span className="font-mono text-xs font-medium text-stone-900 select-all truncate">
                    {pixKey}
                  </span>
                  <button
                    type="button"
                    onClick={copyPix}
                    className="shrink-0 rounded-lg bg-[#47582e] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#394725]"
                  >
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            )}

            {/* Botão de Link Externo para Comprar se houver */}
            {selectedGift.url && (
              <div className="mt-4">
                <a
                  href={selectedGift.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d9753e] px-6 py-2.5 font-caps text-xs tracking-widest text-white shadow-sm transition hover:bg-[#c2622e]"
                >
                  Ir para a loja e comprar presente ↗
                </a>
              </div>
            )}

            {/* Feedback de Sucesso */}
            {successMessage && (
              <div role="status" className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                {successMessage}
              </div>
            )}

            {/* Ação de Confirmar Compra */}
            {!confirmingPurchase ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setConfirmingPurchase(true)}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-[#47582e] bg-white px-6 py-2.5 font-caps text-xs tracking-widest text-[#47582e] font-bold transition hover:bg-[#47582e] hover:text-white"
                >
                  Já comprei este presente
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border-2 border-[#47582e] bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#2C221A]">
                  Deseja confirmar que você comprou este presente para os noivos?
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleConfirmBought}
                    className="flex-1 rounded-xl bg-[#47582e] py-2.5 font-caps text-xs font-bold text-white transition hover:bg-[#394725] disabled:opacity-50"
                  >
                    {isPending ? "Confirmando..." : "Sim, já comprei!"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingPurchase(false)}
                    className="flex-1 rounded-xl border border-stone-300 py-2.5 font-caps text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal do Pix Avulso */}
      {pixModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPixModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#FAF7F2] p-6 text-center text-[#2C221A] shadow-2xl border border-stone-200/90 sm:p-8">
            {/* Botão Fechar em Alto Contraste */}
            <button
              type="button"
              onClick={() => setPixModalOpen(false)}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2C221A] shadow-sm border border-stone-200 transition duration-200 hover:bg-[#d9753e] hover:text-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9753e]"
              aria-label="Fechar janela"
              title="Fechar janela (ESC)"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs p-3 border border-stone-200/60">
              <Image src="/images/pix.svg" alt="Pix" width={48} height={48} className="h-10 w-10 object-contain" />
            </div>

            <h3 className="mt-4 font-caps text-xl font-bold tracking-wide text-[#2C221A]">
              Pix Avulso
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5E4E41]">
              Se preferir nos presentear com qualquer outro valor, você pode realizar uma transferência via Pix diretamente para a conta dos noivos:
            </p>

            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-xs">
              <p className="text-[0.7rem] font-bold tracking-wider text-[#5E4E41] uppercase">Chave Pix</p>
              <p className="mt-1 font-mono text-sm font-bold text-stone-900 select-all break-all">
                {pixKey}
              </p>
            </div>

            <button
              type="button"
              onClick={copyPix}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d9753e] px-6 py-3 font-caps text-xs tracking-widest text-white shadow-md transition hover:bg-[#c2622e]"
            >
              {copied ? "Chave Pix copiada com sucesso!" : "COPIAR CHAVE PIX"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
