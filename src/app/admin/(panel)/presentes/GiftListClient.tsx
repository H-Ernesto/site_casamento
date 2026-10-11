"use client";

import { useState } from "react";
import GiftFormModal from "./GiftFormModal";
import { toggleArchiveGift, deleteGift } from "./actions";

type GiftItem = {
  id: string;
  name: string;
  priceCents: number;
  url: string;
  imageUrl?: string;
  archivedAt: Date | null;
  selectedCount: number;
};

export default function GiftListClient({
  gifts,
  showArchived,
}: {
  gifts: GiftItem[];
  showArchived: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);

  function handleNew() {
    setEditingGift(null);
    setModalOpen(true);
  }

  function handleEdit(g: GiftItem) {
    setEditingGift(g);
    setModalOpen(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {showArchived ? "Presentes arquivados" : "Lista de presentes"}
        </h1>
        <div className="flex items-center gap-3">
          <a
            href={showArchived ? "/admin/presentes" : "/admin/presentes?arquivados=1"}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {showArchived ? "Ver ativos" : "Ver arquivados"}
          </a>
          <button
            type="button"
            onClick={handleNew}
            className="rounded-md bg-[#7c8d5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b7a4d]"
          >
            + Novo presente
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium text-center">Quantidade Escolhida</th>
              <th className="px-4 py-3 font-medium">Link</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Nenhum presente cadastrado.
                </td>
              </tr>
            ) : (
              gifts.map((g) => {
                const formattedPrice = (g.priceCents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                return (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{g.name}</td>
                    <td className="px-4 py-3 text-slate-700">{formattedPrice}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        {g.selectedCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {g.url ? (
                        <a
                          href={g.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7c8d5b] underline"
                        >
                          Abrir link
                        </a>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(g)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Editar
                        </button>

                        <form action={toggleArchiveGift}>
                          <input type="hidden" name="id" value={g.id} />
                          <input
                            type="hidden"
                            name="archive"
                            value={showArchived ? "0" : "1"}
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {showArchived ? "Restaurar" : "Arquivar"}
                          </button>
                        </form>

                        <form action={deleteGift}>
                          <input type="hidden" name="id" value={g.id} />
                          <button
                            type="submit"
                            onClick={(e) => {
                              if (!confirm("Deseja realmente excluir este presente?")) {
                                e.preventDefault();
                              }
                            }}
                            className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <GiftFormModal gift={editingGift} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
