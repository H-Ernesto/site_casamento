import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import GiftListClient from "./GiftListClient";

export const dynamic = "force-dynamic";

export default async function PresentesPage({
  searchParams,
}: {
  searchParams: Promise<{ arquivados?: string }>;
}) {
  const { wedding } = await requireAdmin();
  const sp = await searchParams;
  const showArchived = sp.arquivados === "1";

  const gifts = await db.gift.findMany({
    where: {
      weddingId: wedding.id,
      archivedAt: showArchived ? { not: null } : null,
    },
    include: {
      _count: {
        select: { selections: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedGifts = gifts.map((g) => ({
    id: g.id,
    name: g.name,
    priceCents: g.priceCents,
    url: g.url,
    imageUrl: g.imageUrl,
    archivedAt: g.archivedAt,
    selectedCount: g._count.selections,
  }));

  return (
    <div className="max-w-5xl">
      <GiftListClient gifts={formattedGifts} showArchived={showArchived} />
    </div>
  );
}
