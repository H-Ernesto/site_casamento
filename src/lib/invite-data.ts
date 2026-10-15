import { db } from "@/lib/db";

/**
 * Carrega SOMENTE os dados que um convidado pode ver.
 * - Resolve o convite por (slug do casamento + slug do convite) — slug com sufixo aleatório.
 * - Convites arquivados não são acessíveis.
 * - Nunca retorna dados privados de outros convidados.
 */
export async function getPublicInvite(weddingSlug: string, inviteSlug: string) {
  const invitation = await db.invitation.findFirst({
    where: { slug: inviteSlug, archivedAt: null, wedding: { slug: weddingSlug } },
    include: {
      rsvp: true,
      favorAnswers: true,
      wedding: {
        include: {
          settings: true,
          photos: { orderBy: [{ isCover: "desc" }, { position: "asc" }] },
          gifts: {
            where: { archivedAt: null },
            orderBy: { createdAt: "desc" },
            include: {
              _count: {
                select: { selections: true },
              },
            },
          },
          favors: {
            orderBy: { position: "asc" },
            include: {
              questions: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });
  if (!invitation || !invitation.wedding.settings) return null;

  const { wedding, rsvp, favorAnswers, ...inv } = invitation;
  const s = wedding.settings!;

  return {
    wedding: { slug: wedding.slug },
    settings: {
      groomName: s.groomName,
      brideName: s.brideName,
      eventAt: s.eventAt,
      venueName: s.venueName,
      address: s.address,
      mapsUrl: s.mapsUrl,
      dressCode: s.dressCode,
      welcomeMessage: s.welcomeMessage,
      story: s.story,
      rsvpMessage: s.rsvpMessage,
      finalMessage: s.finalMessage,
      pixKey: s.pixKey,
      heroPhotoUrl: s.heroPhotoUrl,
    },
    photos: wedding.photos.map((p) => ({ id: p.id, url: p.url })),
    gifts: wedding.gifts.map((g) => ({
      id: g.id,
      name: g.name,
      priceCents: g.priceCents,
      url: g.url,
      imageUrl: g.imageUrl,
      selectedCount: g._count.selections,
    })),
    favors: wedding.favors.map((f) => ({
      id: f.id,
      name: f.name,
      questions: f.questions.map((q) => ({
        id: q.id,
        label: q.label,
        options: q.options ? q.options.split("|").map((o) => o.trim()).filter(Boolean) : [],
      })),
    })),
    invitation: {
      id: inv.id,
      slug: inv.slug,
      displayName: inv.displayName,
      type: inv.type,
      maxGuests: inv.maxGuests,
      favorCount: inv.favorCount,
    },
    favorAnswers: favorAnswers.map((a) => ({
      questionId: a.questionId,
      itemIndex: a.itemIndex,
      value: a.value,
    })),
    rsvp: rsvp
      ? { status: rsvp.status, adults: rsvp.adults, children: rsvp.children, changed: rsvp.changed }
      : null,
  };
}

export type PublicInvite = NonNullable<Awaited<ReturnType<typeof getPublicInvite>>>;

/**
 * Carrega SOMENTE os dados públicos gerais do casamento (História, Fotos, Presentes, Informações básicas).
 * Não depende de nenhum convite específico.
 */
export async function getPublicWedding(weddingSlug?: string) {
  const where = weddingSlug ? { slug: weddingSlug } : {};
  const wedding = await db.wedding.findFirst({
    where,
    include: {
      settings: true,
      photos: { orderBy: [{ isCover: "desc" }, { position: "asc" }] },
      gifts: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { selections: true },
          },
        },
      },
    },
  });
  if (!wedding || !wedding.settings) return null;
  const s = wedding.settings;

  return {
    wedding: { slug: wedding.slug },
    settings: {
      groomName: s.groomName,
      brideName: s.brideName,
      eventAt: s.eventAt,
      venueName: s.venueName,
      address: s.address,
      mapsUrl: s.mapsUrl,
      dressCode: s.dressCode,
      welcomeMessage: s.welcomeMessage,
      story: s.story,
      rsvpMessage: s.rsvpMessage,
      finalMessage: s.finalMessage,
      pixKey: s.pixKey,
      heroPhotoUrl: s.heroPhotoUrl,
    },
    photos: wedding.photos.map((p) => ({ id: p.id, url: p.url })),
    gifts: wedding.gifts.map((g) => ({
      id: g.id,
      name: g.name,
      priceCents: g.priceCents,
      url: g.url,
      imageUrl: g.imageUrl,
      selectedCount: g._count.selections,
    })),
  };
}

export type PublicWedding = NonNullable<Awaited<ReturnType<typeof getPublicWedding>>>;
