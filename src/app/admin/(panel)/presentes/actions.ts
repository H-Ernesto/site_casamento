"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type FormState = { error?: string; success?: boolean } | undefined;

const giftSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Informe o nome do presente.").max(120),
  price: z.string().trim().min(1, "Informe o valor do presente."),
  url: z.string().trim().url("Link externo inválido (deve iniciar com http:// ou https://).").or(z.literal("")),
  imageUrl: z.string().trim().optional(),
});

function parsePriceToCents(str: string): number {
  const clean = str.replace(/[^\d.,]/g, "").replace(",", ".");
  const num = parseFloat(clean);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100);
}

export async function saveGift(_: FormState, formData: FormData): Promise<FormState> {
  const { wedding } = await requireAdmin();

  const parsed = giftSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    price: formData.get("price"),
    url: formData.get("url") || "",
    imageUrl: formData.get("imageUrl") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, name, price, url, imageUrl } = parsed.data;
  const priceCents = parsePriceToCents(price);
  if (priceCents <= 0) {
    return { error: "O valor deve ser maior que zero." };
  }

  if (id) {
    const existing = await db.gift.findFirst({
      where: { id, weddingId: wedding.id },
    });
    if (!existing) return { error: "Presente não encontrado." };

    await db.gift.update({
      where: { id },
      data: { name, priceCents, url: url || "", imageUrl: imageUrl || "" },
    });
  } else {
    await db.gift.create({
      data: {
        weddingId: wedding.id,
        name,
        priceCents,
        url: url || "",
        imageUrl: imageUrl || "",
      },
    });
  }

  revalidatePath("/admin/presentes");
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function toggleArchiveGift(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const archive = formData.get("archive") === "1";

  await db.gift.updateMany({
    where: { id, weddingId: wedding.id },
    data: { archivedAt: archive ? new Date() : null },
  });

  revalidatePath("/admin/presentes");
  revalidatePath("/admin", "layout");
}

export async function deleteGift(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const existing = await db.gift.findFirst({
    where: { id, weddingId: wedding.id },
    include: { _count: { select: { selections: true } } },
  });
  if (!existing) return;

  // Se já foi escolhido por alguém, não exclui para preservar histórico; o usuário deve arquivar
  if (existing._count.selections > 0) {
    await db.gift.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  } else {
    await db.gift.delete({
      where: { id },
    });
  }

  revalidatePath("/admin/presentes");
  revalidatePath("/admin", "layout");
}
