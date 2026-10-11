import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import FavorDashboardClient from "./FavorDashboardClient";

export const dynamic = "force-dynamic";

export default async function LembrancinhasPage() {
  const { wedding } = await requireAdmin();

  // 1. Total necessário em todos os convites ativos
  const activeInvitations = await db.invitation.findMany({
    where: { weddingId: wedding.id, archivedAt: null },
    include: { rsvp: true },
  });

  const totalRequired = activeInvitations.reduce((sum, inv) => sum + inv.favorCount, 0);
  const totalConfirmedFavors = activeInvitations
    .filter((inv) => inv.rsvp?.status === "CONFIRMED")
    .reduce((sum, inv) => sum + inv.favorCount, 0);

  // 2. Lembrancinhas e perguntas
  const favors = await db.favor.findMany({
    where: { weddingId: wedding.id },
    orderBy: { position: "asc" },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: {
          answers: {
            where: {
              invitation: { archivedAt: null },
            },
            include: {
              invitation: {
                select: { displayName: true },
              },
            },
          },
        },
      },
    },
  });

  // 3. Agregar contagem por resposta para cada pergunta
  const formattedFavors = favors.map((favor) => ({
    id: favor.id,
    name: favor.name,
    questions: favor.questions.map((q) => {
      // Agrupar respostas
      const countsMap = new Map<string, { count: number; invites: { invitationName: string; itemIndex: number }[] }>();

      for (const ans of q.answers) {
        const val = ans.value;
        const current = countsMap.get(val) ?? { count: 0, invites: [] };
        current.count += 1;
        current.invites.push({
          invitationName: ans.invitation.displayName,
          itemIndex: ans.itemIndex,
        });
        countsMap.set(val, current);
      }

      const answersList = Array.from(countsMap.entries()).map(([value, data]) => ({
        value,
        count: data.count,
        invites: data.invites,
      }));

      // Ordena por quantidade descrescente
      answersList.sort((a, b) => b.count - a.count);

      return {
        id: q.id,
        label: q.label,
        options: q.options,
        answers: answersList,
      };
    }),
  }));

  return (
    <div className="max-w-5xl">
      <FavorDashboardClient
        totalRequired={totalRequired}
        totalConfirmedFavors={totalConfirmedFavors}
        favors={formattedFavors}
      />
    </div>
  );
}
