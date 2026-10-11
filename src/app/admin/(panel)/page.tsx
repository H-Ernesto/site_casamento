import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import CircularProgress from "@/components/admin/CircularProgress";

export const dynamic = "force-dynamic";

function StatCard({ label, value, subtext }: { label: string; value: number | string; subtext?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#7c8d5b]/40 transition">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}

export default async function Overview() {
  const { wedding } = await requireAdmin();

  // 1. Convidados e RSVP
  const invitations = await db.invitation.findMany({
    where: { weddingId: wedding.id, archivedAt: null },
    include: { rsvp: true },
  });

  const totalInvites = invitations.length;
  const confirmed = invitations.filter((i) => i.rsvp?.status === "CONFIRMED");
  const declined = invitations.filter((i) => i.rsvp?.status === "DECLINED");
  const pending = invitations.filter((i) => !i.rsvp);
  const adults = confirmed.reduce((n, i) => n + (i.rsvp?.adults ?? 0), 0);
  const children = confirmed.reduce((n, i) => n + (i.rsvp?.children ?? 0), 0);
  const totalGuests = adults + children;

  // 2. Resumo de Lembrancinhas
  const totalFavorsExpected = invitations.reduce((n, i) => n + i.favorCount, 0);
  const totalFavorsConfirmed = confirmed.reduce((n, i) => n + i.favorCount, 0);
  const favorsRemaining = Math.max(0, totalFavorsExpected - totalFavorsConfirmed);

  // 3. Resumo dos Presentes
  const gifts = await db.gift.findMany({
    where: { weddingId: wedding.id, archivedAt: null },
    include: {
      _count: { select: { selections: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const totalGiftsCount = gifts.length;
  const totalGiftsSelected = gifts.reduce((n, g) => n + g._count.selections, 0);
  const giftsWithSelection = gifts.filter((g) => g._count.selections > 0).length;
  const giftsAvailable = Math.max(0, totalGiftsCount - giftsWithSelection);

  // Percentuais para centros dos gráficos
  const respondedCount = confirmed.length + declined.length;
  const rsvpResponseRate = totalInvites > 0 ? Math.round((respondedCount / totalInvites) * 100) : 0;
  const favorsRate = totalFavorsExpected > 0 ? Math.round((totalFavorsConfirmed / totalFavorsExpected) * 100) : 0;
  const giftsRate = totalGiftsCount > 0 ? Math.round((giftsWithSelection / totalGiftsCount) * 100) : 0;

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral do Casamento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhe o progresso das confirmações, convidados e presentes em tempo real.
        </p>
      </div>

      {/* Gráficos Circulares de Progresso */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gráfico 1: Confirmações de Presença (RSVP) */}
        <CircularProgress
          title="Status do RSVP"
          subtitle="Respostas dos convites"
          centerValue={`${rsvpResponseRate}%`}
          centerLabel="Respondidos"
          segments={[
            { label: "Confirmados", value: confirmed.length, color: "#7c8d5b" },
            { label: "Não responderam", value: pending.length, color: "#e8ab3d" },
            { label: "Recusados", value: declined.length, color: "#d98b84" },
          ]}
        />

        {/* Gráfico 2: Composição dos Convidados */}
        <CircularProgress
          title="Pessoas Confirmadas"
          subtitle="Adultos e crianças"
          centerValue={totalGuests}
          centerLabel="Total Pessoas"
          segments={[
            { label: "Adultos", value: adults, color: "#7c8d5b" },
            { label: "Crianças", value: children, color: "#b9a0c9" },
          ]}
        />

        {/* Gráfico 3: Meta de Lembrancinhas */}
        <CircularProgress
          title="Lembrancinhas"
          subtitle="Previsto vs Confirmado"
          centerValue={`${favorsRate}%`}
          centerLabel="Garantidas"
          segments={[
            { label: "Confirmadas", value: totalFavorsConfirmed, color: "#7c8d5b" },
            { label: "Aguardando", value: favorsRemaining, color: "#e2e8f0" },
          ]}
        />

        {/* Gráfico 4: Progresso dos Presentes */}
        <CircularProgress
          title="Lista de Presentes"
          subtitle="Itens presenteados"
          centerValue={`${giftsRate}%`}
          centerLabel="Escolhidos"
          segments={[
            { label: "Já presenteados", value: giftsWithSelection, color: "#ea8b54" },
            { label: "Disponíveis", value: giftsAvailable, color: "#7c8d5b" },
          ]}
        />
      </div>

      {/* Métricas Rápidas */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Detalhamento dos Números</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total de convites" value={totalInvites} subtext="Cadastrados no sistema" />
          <StatCard label="Convites confirmados" value={confirmed.length} subtext={`${rsvpResponseRate}% de retorno`} />
          <StatCard label="Pendentes" value={pending.length} subtext="Aguardando resposta" />
          <StatCard label="Total de presentes" value={totalGiftsCount} subtext={`${totalGiftsSelected} unidades compradas`} />
        </div>
      </div>

      {/* Ações e Atalhos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Painel Lembrancinhas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Lembrancinhas do Evento</h2>
              <p className="text-xs text-slate-500 mt-0.5">Previsão por convite confirmado</p>
            </div>
            <Link
              href="/admin/lembrancinhas"
              className="rounded-lg bg-[#7c8d5b]/10 px-3 py-1.5 text-xs font-semibold text-[#7c8d5b] hover:bg-[#7c8d5b]/20 transition"
            >
              Ver relatório →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total Previsto</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{totalFavorsExpected}</p>
            </div>
            <div className="rounded-xl bg-[#7c8d5b]/10 p-4 border border-[#7c8d5b]/20">
              <p className="text-xs font-semibold text-[#7c8d5b]">Total Confirmado</p>
              <p className="mt-1 text-2xl font-bold text-[#7c8d5b]">{totalFavorsConfirmed}</p>
            </div>
          </div>
        </div>

        {/* Painel Presentes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Lista de Presentes</h2>
              <p className="text-xs text-slate-500 mt-0.5">Gestão de itens e doações Pix</p>
            </div>
            <Link
              href="/admin/presentes"
              className="rounded-lg bg-[#ea8b54]/10 px-3 py-1.5 text-xs font-semibold text-[#ea8b54] hover:bg-[#ea8b54]/20 transition"
            >
              Gerenciar presentes →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Itens Cadastrados</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{totalGiftsCount}</p>
            </div>
            <div className="rounded-xl bg-[#ea8b54]/10 p-4 border border-[#ea8b54]/20">
              <p className="text-xs font-semibold text-[#ea8b54]">Total Comprados</p>
              <p className="mt-1 text-2xl font-bold text-[#ea8b54]">{totalGiftsSelected}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
