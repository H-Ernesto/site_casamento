"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, requireAdmin } from "@/lib/session";

export type FormState = { error?: string } | undefined;

// Limitador simples em memória (por username). Em produção, trocar por Redis/Upstash.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function tooMany(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || now - a.first > WINDOW) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  a.count++;
  return a.count > MAX_ATTEMPTS;
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Informe usuário e senha." };

  if (tooMany(username.toLowerCase())) return { error: "Muitas tentativas. Aguarde alguns minutos." };

  const user = await db.user.findUnique({ where: { username } });
  // compara mesmo sem usuário para não vazar existência por tempo de resposta
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) return { error: "Usuário ou senha incorretos." };

  attempts.delete(username.toLowerCase());
  await createSession(user.id);
  redirect(user.mustChangePassword ? "/admin/alterar-senha" : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

const pwSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    next: z.string().min(8, "A nova senha deve ter ao menos 8 caracteres."),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "A confirmação não confere.", path: ["confirm"] })
  .refine((v) => v.next !== "12345678", { message: "Escolha uma senha diferente da inicial.", path: ["next"] });

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireAdmin({ allowPasswordChange: true });

  const parsed = pwSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return { error: "Senha atual incorreta." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 12), mustChangePassword: false },
  });
  redirect("/admin");
}
