import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";

const COOKIE = "gd_session";
const LAST_INVITE_COOKIE = "gd_last_invite";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const key = secret();

  // Se o noivo/admin estiver logado, vai direto para o painel
  if (token && key) {
    try {
      await jwtVerify(token, key);
      redirect("/admin");
    } catch {
      // token inválido ou expirado
    }
  }

  // Se for um convidado que já acessou o convite neste navegador, redireciona para seu convite
  const lastInvite = cookieStore.get(LAST_INVITE_COOKIE)?.value;
  if (lastInvite && lastInvite.startsWith("/")) {
    redirect(lastInvite);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-6 text-center text-ink antialiased">
      <div className="max-w-md rounded-3xl border border-stone-200/80 bg-white/90 p-8 shadow-xs backdrop-blur-xs sm:p-12">
        <h1 className="font-script text-6xl text-[#47582e] sm:text-7xl">Gustavo &amp; Débora</h1>
        <p className="mt-4 font-caps tracking-widest text-xs sm:text-sm text-[#5E4E41]">
          Acesse pelo link personalizado do seu convite.
        </p>
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center rounded-full bg-[#47582e] px-8 py-3.5 font-caps text-xs tracking-widest text-white shadow-md transition-all hover:bg-[#394725] hover:shadow-lg"
          >
            Área dos Noivos
          </Link>
        </div>
      </div>
    </main>
  );
}

