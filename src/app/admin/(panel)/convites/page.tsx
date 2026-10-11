import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { TYPE_LABEL, type InvitationType } from "@/lib/rules";
import LinkActions from "./LinkActions";
import { setArchived } from "./actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  ["all", "Todos"],
  ["confirmed", "Confirmados"],
  ["pending", "Não responderam"],
  ["declined", "Recusaram"],
  ["children", "Com crianças"],
  ["favor", "Com lembrancinha"],
  ["nofavor", "Sem lembrancinha"],
] as const;

const SORTS = [
  ["recent", "Mais recentes"],
  ["name", "Nome (A–Z)"],
  ["status", "Status"],
  ["total", "Total confirmado"],
] as const;

function statusOf(rsvp: { status: string } | null) {
  if (!rsvp) return { label: "Não respondeu", cls: "bg-slate-100 text-slate-700" };
  return rsvp.status === "CONFIRMED"
    ? { label: "Confirmado", cls: "bg-green-100 text-green-800" }
    : { label: "Recusado", cls: "bg-red-100 text-red-800" };
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: string; s?: string; arquivados?: string }>;
}) {
  const { wedding } = await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const f = sp.f ?? "all";
  const s = sp.s ?? "recent";
  const archived = sp.arquivados === "1";

  const all = await db.invitation.findMany({
    where: { weddingId: wedding.id, archivedAt: archived ? { not: null } : null },
    include: { rsvp: true },
    orderBy: { createdAt: "desc" },
  });

  const total = (i: (typeof all)[number]) => (i.rsvp?.status === "CONFIRMED" ? i.rsvp.adults + i.rsvp.children : 0);

  let rows = all.filter((i) => {
    if (q && !i.displayName.toLowerCase().includes(q)) return false;
    switch (f) {
      case "confirmed": return i.rsvp?.status === "CONFIRMED";
      case "pending": return !i.rsvp;
      case "declined": return i.rsvp?.status === "DECLINED";
      case "children": return i.rsvp?.status === "CONFIRMED" && i.rsvp.children > 0;
      case "favor": return i.favorCount > 0;
      case "nofavor": return i.favorCount === 0;
      default: return true;
    }
  });

  if (s === "name") rows = [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
  if (s === "status") rows = [...rows].sort((a, b) => statusOf(a.rsvp).label.localeCompare(statusOf(b.rsvp).label, "pt-BR"));
  if (s === "total") rows = [...rows].sort((a, b) => total(b) - total(a));

  const control = "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{archived ? "Convites arquivados" : "Convites"}</h1>
        <div className="flex items-center gap-3">
          <a
            href="/admin/convites/exportar"
            download
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar convidados (.xlsx)
          </a>
          <Link href="/admin/convites/novo" className="rounded-md bg-[#7c8d5b] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b7a4d]">
            + Novo convite
          </Link>
        </div>
      </div>

      <form className="mt-5 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Buscar por nome" aria-label="Buscar por nome" className={`${control} w-56`} />
        <select name="f" defaultValue={f} aria-label="Filtrar" className={control}>
          {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="s" defaultValue={s} aria-label="Ordenar" className={control}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {archived && <input type="hidden" name="arquivados" value="1" />}
        <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">Aplicar</button>
        <Link href={archived ? "/admin/convites" : "/admin/convites?arquivados=1"} className="px-2 py-2 text-sm text-slate-600 underline">
          {archived ? "Ver ativos" : "Ver arquivados"}
        </Link>
      </form>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              {["Convite", "Tipo", "Limite", "Adultos", "Crianças", "Total", "Status", "Lembr.", "Ações"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-500">Nenhum convite encontrado.</td></tr>
            )}
            {rows.map((i) => {
              const st = statusOf(i.rsvp);
              const confirmed = i.rsvp?.status === "CONFIRMED";
              const path = `/${wedding.slug}/${i.slug}`;
              return (
                <tr key={i.id}>
                  <td className="px-3 py-3 font-medium">{i.displayName}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{TYPE_LABEL[i.type as InvitationType]}</td>
                  <td className="px-3 py-3">{i.maxGuests}</td>
                  <td className="px-3 py-3">{confirmed ? i.rsvp!.adults : "–"}</td>
                  <td className="px-3 py-3">{confirmed ? i.rsvp!.children : "–"}</td>
                  <td className="px-3 py-3">{confirmed ? total(i) : "–"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                    {i.rsvp?.changed && <span className="ml-1 text-xs text-amber-700">(alterado)</span>}
                  </td>
                  <td className="px-3 py-3">{i.favorCount || "–"}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <a href={path} target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Visualizar</a>
                      <Link href={`/admin/convites/${i.id}/editar`} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">Editar</Link>
                      <LinkActions path={path} title={i.displayName} />
                      <form action={setArchived}>
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="archive" value={archived ? "0" : "1"} />
                        <button className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                          {archived ? "Restaurar" : "Arquivar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
