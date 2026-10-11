"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { validateRsvp } from "@/lib/rules";

export type RsvpState = { error?: string; ok?: "CONFIRMED" | "DECLINED"; updated?: boolean } | undefined;

const rsvpSchema = z.object({
  weddingSlug: z.string().min(1).max(80),
  inviteSlug: z.string().min(1).max(120),
  status: z.enum(["CONFIRMED", "DECLINED"]),
  adults: z.coerce.number().int().min(0).max(100).default(0),
  children: z.coerce.number().int().min(0).max(100).default(0),
});

export async function submitRsvp(_: RsvpState, formData: FormData): Promise<RsvpState> {
  const parsed = rsvpSchema.safeParse({
    weddingSlug: formData.get("weddingSlug"),
    inviteSlug: formData.get("inviteSlug"),
    status: formData.get("status"),
    adults: formData.get("adults") || 0,
    children: formData.get("children") || 0,
  });
  if (!parsed.success) return { error: "Dados inválidos. Revise e tente novamente." };
  const d = parsed.data;

  const inv = await db.invitation.findFirst({
    where: { slug: d.inviteSlug, archivedAt: null, wedding: { slug: d.weddingSlug } },
    include: { rsvp: true },
  });
  if (!inv) return { error: "Convite não encontrado." };

  const adults = d.status === "CONFIRMED" ? d.adults : 0;
  const children = d.status === "CONFIRMED" ? d.children : 0;
  const err = validateRsvp({ status: d.status, adults, children }, inv.maxGuests);
  if (err) return { error: err };

  const existed = !!inv.rsvp;
  await db.invitationRSVP.upsert({
    where: { invitationId: inv.id },
    create: { invitationId: inv.id, status: d.status, adults, children },
    update: { status: d.status, adults, children, changed: true },
  });

  revalidatePath(`/${d.weddingSlug}/${d.inviteSlug}`);
  revalidatePath("/admin", "layout");
  return { ok: d.status, updated: existed };
}

export type GiftActionState = { error?: string; ok?: boolean } | undefined;

export async function selectGift(giftId: string, weddingSlug: string, inviteSlug: string): Promise<GiftActionState> {
  const inv = await db.invitation.findFirst({
    where: { slug: inviteSlug, archivedAt: null, wedding: { slug: weddingSlug } },
    include: { wedding: true },
  });
  if (!inv) return { error: "Convite não encontrado." };

  const gift = await db.gift.findFirst({
    where: { id: giftId, weddingId: inv.weddingId, archivedAt: null },
  });
  if (!gift) return { error: "Presente não encontrado." };

  await db.giftSelection.create({
    data: {
      giftId: gift.id,
      invitationId: inv.id,
    },
  });

  revalidatePath(`/${weddingSlug}/${inviteSlug}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export type FavorActionState = { error?: string; ok?: boolean } | undefined;

export async function submitFavorAnswers(
  weddingSlug: string,
  inviteSlug: string,
  answers: { questionId: string; itemIndex: number; value: string }[]
): Promise<FavorActionState> {
  const inv = await db.invitation.findFirst({
    where: { slug: inviteSlug, archivedAt: null, wedding: { slug: weddingSlug } },
  });
  if (!inv) return { error: "Convite não encontrado." };
  if (inv.favorCount <= 0) return { error: "Este convite não possui lembrancinhas." };

  for (const a of answers) {
    if (!a.value.trim()) continue;
    if (a.itemIndex < 1 || a.itemIndex > inv.favorCount) continue;

    await db.favorAnswer.upsert({
      where: {
        invitationId_questionId_itemIndex: {
          invitationId: inv.id,
          questionId: a.questionId,
          itemIndex: a.itemIndex,
        },
      },
      create: {
        invitationId: inv.id,
        questionId: a.questionId,
        itemIndex: a.itemIndex,
        value: a.value.trim(),
      },
      update: {
        value: a.value.trim(),
      },
    });
  }

  revalidatePath(`/${weddingSlug}/${inviteSlug}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
