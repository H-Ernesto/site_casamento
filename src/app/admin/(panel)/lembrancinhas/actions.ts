"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type FormState = { error?: string; success?: boolean } | undefined;

const favorSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Informe o nome da lembrancinha.").max(100),
  questionsJson: z.string(),
});

type QuestionInput = {
  id?: string;
  label: string;
  options: string;
};

export async function saveFavor(_: FormState, formData: FormData): Promise<FormState> {
  const { wedding } = await requireAdmin();

  const parsed = favorSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    questionsJson: formData.get("questionsJson"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, name, questionsJson } = parsed.data;

  let questions: QuestionInput[] = [];
  try {
    questions = JSON.parse(questionsJson);
  } catch {
    return { error: "Formato de perguntas inválido." };
  }

  if (questions.length === 0) {
    return { error: "Adicione ao menos uma pergunta para esta lembrancinha." };
  }

  for (const q of questions) {
    if (!q.label.trim()) {
      return { error: "Todas as perguntas devem possuir um texto descritivo." };
    }
  }

  if (id) {
    const existing = await db.favor.findFirst({
      where: { id, weddingId: wedding.id },
    });
    if (!existing) return { error: "Lembrancinha não encontrada." };

    await db.$transaction(async (tx) => {
      await tx.favor.update({
        where: { id },
        data: { name },
      });

      // Remove perguntas antigas não presentes e atualiza/cria novas
      await tx.favorQuestion.deleteMany({
        where: { favorId: id },
      });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await tx.favorQuestion.create({
          data: {
            favorId: id,
            label: q.label.trim(),
            options: q.options.trim(),
            position: i,
          },
        });
      }
    });
  } else {
    await db.favor.create({
      data: {
        weddingId: wedding.id,
        name,
        questions: {
          create: questions.map((q, i) => ({
            label: q.label.trim(),
            options: q.options.trim(),
            position: i,
          })),
        },
      },
    });
  }

  revalidatePath("/admin/lembrancinhas");
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function deleteFavor(formData: FormData) {
  const { wedding } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  await db.favor.deleteMany({
    where: { id, weddingId: wedding.id },
  });

  revalidatePath("/admin/lembrancinhas");
  revalidatePath("/admin", "layout");
}
