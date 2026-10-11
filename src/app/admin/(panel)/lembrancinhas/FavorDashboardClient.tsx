"use client";

import { useState } from "react";
import FavorFormModal from "./FavorFormModal";
import { deleteFavor } from "./actions";

type InviteDetail = {
  invitationName: string;
  itemIndex: number;
};

type AnswerCount = {
  value: string;
  count: number;
  invites: InviteDetail[];
};

type QuestionSummary = {
  id: string;
  label: string;
  options: string;
  answers: AnswerCount[];
};

type FavorItem = {
  id: string;
  name: string;
  questions: QuestionSummary[];
};

type Props = {
  totalRequired: number;
  totalConfirmedFavors: number;
  favors: FavorItem[];
};

export default function FavorDashboardClient({
  totalRequired,
  totalConfirmedFavors,
  favors,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFavor, setEditingFavor] = useState<FavorItem | null>(null);

  // Modal para detalhar convites de uma resposta específica
  const [detailModal, setDetailModal] = useState<{
    questionLabel: string;
    answerValue: string;
    invites: InviteDetail[];
  } | null>(null);

  function handleNew() {
    setEditingFavor(null);
    setModalOpen(true);
  }

  function handleEdit(f: FavorItem) {
    setEditingFavor(f);
    setModalOpen(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lembrancinhas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe a quantidade total necessária e as preferências de cada convidado.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-md bg-[#7c8d5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b7a4d]"
        >
          + Nova lembrancinha
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total previsto (todos os convites)
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalRequired}</p>
          <p className="mt-1 text-xs text-slate-500">
            Soma de lembrancinhas cadastradas nos convites ativos
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total confirmado (RSVP confirmado)
          </p>
          <p className="mt-2 text-3xl font-bold text-[#7c8d5b]">{totalConfirmedFavors}</p>
          <p className="mt-1 text-xs text-slate-500">
            Lembrancinhas de convidados que já confirmaram presença
          </p>
        </div>
      </div>

      {/* Seção das Lembrancinhas */}
      <div className="mt-8 space-y-6">
        {favors.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Nenhuma lembrancinha cadastrada ainda. Clique em &quot;+ Nova lembrancinha&quot; para começar.
          </div>
        ) : (
          favors.map((favor) => (
            <div
              key={favor.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-semibold text-slate-900">{favor.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(favor)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar perguntas
                  </button>
                  <form action={deleteFavor}>
                    <input type="hidden" name="id" value={favor.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm("Deseja realmente excluir esta lembrancinha?")) {
                          e.preventDefault();
                        }
                      }}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </div>

              {/* Perguntas e contagem de respostas */}
              <div className="mt-6 space-y-6">
                {favor.questions.map((q) => (
                  <div key={q.id} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-800">{q.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Clique em uma resposta para ver quais convites escolheram esta opção.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.answers.length === 0 ? (
                        <p className="text-xs text-slate-400">Nenhuma resposta registrada ainda.</p>
                      ) : (
                        q.answers.map((ans) => (
                          <button
                            key={ans.value}
                            type="button"
                            onClick={() =>
                              setDetailModal({
                                questionLabel: q.label,
                                answerValue: ans.value,
                                invites: ans.invites,
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#7c8d5b] hover:bg-[#7c8d5b]/10"
                          >
                            <span>{ans.value}:</span>
                            <span className="rounded-full bg-[#7c8d5b] px-2 py-0.5 font-bold text-white">
                              {ans.count}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <FavorFormModal
          favor={editingFavor}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Modal de Detalhes dos Convites */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Convites com a resposta: &ldquo;{detailModal.answerValue}&rdquo;
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pergunta: {detailModal.questionLabel}
            </p>

            <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {detailModal.invites.map((inv, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 text-sm">
                  <span className="font-medium text-slate-800">{inv.invitationName}</span>
                  <span className="text-xs text-slate-500">Opção {inv.itemIndex}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
