import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const COOKIE = "gd_session";
const MAX_AGE = 60 * 60 * 24 * 365; // 365 dias (1 ano)

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curto demais (mín. 32 caracteres).");
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

async function currentUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}

/**
 * Ponto único de autorização do admin. Retorna o usuário e o casamento DELE.
 * Toda query administrativa deve filtrar por `wedding.id` retornado aqui —
 * nunca por um id vindo do cliente — garantindo o isolamento entre casamentos.
 */
export async function requireAdmin(opts: { allowPasswordChange?: boolean } = {}) {
  const uid = await currentUserId();
  if (!uid) redirect("/admin/login");

  const user = await db.user.findUnique({
    where: { id: uid },
    include: { weddings: { include: { settings: true }, take: 1 } },
  });
  if (!user || user.weddings.length === 0) redirect("/admin/login");

  if (user.mustChangePassword && !opts.allowPasswordChange) redirect("/admin/alterar-senha");

  return { user, wedding: user.weddings[0] };
}
