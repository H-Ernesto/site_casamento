"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { INVITATION_TYPES, limitFor, type InvitationType } from "@/lib/rules";
import { invitationSlug } from "@/lib/slug";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  type: z.enum(INVITATION_TYPES),
  displayName: z.string().trim().min(1, "Informe o nome do convite.").max(80, "Nome muito longo (máx. 80)."),
  maxGuests: z.coerce.number().int().min(1, "O limite deve ser ao menos 1.").max(30, "Limite máximo: 30.").optional(),
  hasFavor: z.coerce.boolean().optional(),
  favorCount: z.coerce.number().int().min(0).max(30, "Máximo de 30 lembrancinhas.").optional(),
});

function parse(formData: FormData) {
  const parsed = schema.safeParse({
    type: formData.get("type"),
    displayName: formData.get("displayName"),
    maxGuests: formData.get("maxGuests") || undefined,
    hasFavor: formData.get("hasFavor") === "on",
    favorCount: formData.get("favorCount") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const d = parsed.data;
  if (d.type === "FAMILY" && !d.maxGuests) return { error: "Informe o limite de pessoas da família." } as const;
  const favorCount = d.hasFavor ? (d.favorCount ?? 0) : 0;
  if (d.hasFavor && favorCount < 1) return { error: "Informe a quantidade de lembrancinhas (mín. 1)." } as const;
  return {
    data: {
      type: d.type as InvitationType,
      displayName: d.displayName,
      maxGuests: limitFor(d.type, d.maxGuests),
      favorCount,
    },
  } as const;
}

export async function createInvitation(_: FormState, formData: FormData): Promise<FormState> {
  const { wedding } = await requireAdmin();
  const r = parse(formData);
  if ("error" in r) return { error: r.error };

  for (let i = 0; i < 5; i++) {
    try {
      await db.invitation.create({
        data: { ...r.data, weddingId: wedding.id, slug: invitationSlug(r.data.displayName) },
      });
      revalidatePath("/admin/convites");
      redirect("/admin/convites");
    } catch (e) {
      if (typeof e === "object" && e && "digest" in e) throw e; // redirect do Next
      if ((e as { code?: string }).code !== "P2002") throw e; // só repete em colisão de slug
    }
  }
  return { error: "Não foi possível gerar um link único. Tente novamente." };
}

export async function updateInvitation(_: FormState, formData: FormData): Promise<FormState> {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  // Escopo por casamento: nunca confiar só no id recebido.
  const inv = await db.invitation.findFirst({ where: { id, weddingId: wedding.id }, include: { rsvp: true } });
  if (!inv) return { error: "Convite não encontrado." };

  const r = parse(formData);
  if ("error" in r) return { error: r.error };

  if (inv.rsvp?.status === "CONFIRMED" && inv.rsvp.adults + inv.rsvp.children > r.data.maxGuests) {
    return {
      error: `Este convite já confirmou ${inv.rsvp.adults + inv.rsvp.children} pessoas. O novo limite não pode ser menor.`,
    };
  }

  await db.invitation.update({ where: { id: inv.id }, data: r.data });
  revalidatePath("/admin/convites");
  redirect("/admin/convites");
}

export async function setArchived(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const archive = formData.get("archive") === "1";
  await db.invitation.updateMany({
    where: { id, weddingId: wedding.id },
    data: { archivedAt: archive ? new Date() : null },
  });
  revalidatePath("/admin/convites");
}
