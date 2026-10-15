import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import Navbar from "@/components/Navbar";
import { getPublicWedding } from "@/lib/invite-data";

export const dynamic = "force-dynamic";

type Params = { wedding: string };
type SearchParams = { convite?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { wedding } = await params;
  const data = await getPublicWedding(wedding);
  if (!data) return { title: "Nossa História", robots: { index: false } };
  const names = `${data.settings.groomName} & ${data.settings.brideName}`;
  return {
    title: `Nossa História e Álbum – ${names}`,
    description: `Conheça a história de amor e veja o álbum de fotos de ${names}.`,
    robots: { index: false, follow: false },
  };
}

function Lily({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M24 24 C18 14 18 6 24 2 C30 6 30 14 24 24Z" />
      <path d="M24 24 C14 22 8 16 8 10 C15 9 22 14 24 24Z" />
      <path d="M24 24 C34 22 40 16 40 10 C33 9 26 14 24 24Z" />
      <path d="M24 24 C16 28 10 34 12 42 C19 40 24 34 24 24Z" />
      <path d="M24 24 C32 28 38 34 36 42 C29 40 24 34 24 24Z" />
    </svg>
  );
}

export default async function HistoriaPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { wedding } = await params;
  const sp = await searchParams;
  const data = await getPublicWedding(wedding);
  if (!data) notFound();

  const { settings: s, photos } = data;

  // Resolve o link de volta para o convite personalizado
  const cookieStore = await cookies();
  const lastInviteCookie = cookieStore.get("gd_last_invite")?.value;
  const inviteUrl = sp.convite
    ? `/${wedding}/${sp.convite}`
    : lastInviteCookie && lastInviteCookie.startsWith("/")
      ? lastInviteCookie
      : `/${wedding}`;

  const storyUrl = `/${wedding}/historia`;
  const giftsUrl = `/${wedding}/presentes${sp.convite ? `?convite=${sp.convite}` : ""}`;

  return (
    <main className="min-h-screen bg-cream text-ink antialiased pt-16 sm:pt-20">
      {/* Navbar sempre visível nesta página */}
      <Navbar
        groomName={s.groomName}
        brideName={s.brideName}
        currentPage="historia"
        inviteUrl={inviteUrl}
        storyUrl={storyUrl}
        giftsUrl={giftsUrl}
        alwaysVisible={true}
      />

      {/* Cabeçalho da Página */}
      <header className="relative px-6 pt-10 pb-8 text-center sm:pt-14 sm:pb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#7c8d5b]/50" />
          <Lily className="h-7 w-7 text-[#7c8d5b]" />
          <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#7c8d5b]/50" />
        </div>
        <p className="font-caps text-xs tracking-[0.3em] uppercase text-[#7c8d5b] font-bold">
          {s.groomName} &amp; {s.brideName}
        </p>
        <h1 className="mt-2 font-script text-6xl text-[#47582e] sm:text-7xl md:text-8xl">
          Nossa História &amp; Álbum
        </h1>
        <p className="mt-3 text-sm text-[#5E4E41] max-w-xl mx-auto sm:text-base">
          Momentos especiais e a trajetória que nos trouxe até o dia mais importante de nossas vidas.
        </p>
      </header>

      {/* 1. SEÇÃO: NOSSA HISTÓRIA */}
      {s.story ? (
        <section className="reveal mx-auto max-w-3xl px-6 py-6 sm:py-10">
          <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-b from-white to-[#FAF6F0] p-8 shadow-sm text-center sm:p-14">
            <span className="pointer-events-none absolute -top-5 left-6 font-serif text-8xl text-[#7c8d5b]/15 select-none">“</span>
            <h2 className="font-script text-4xl text-[#47582e] sm:text-5xl mb-6">Como tudo começou</h2>
            <p className="relative z-10 text-base sm:text-lg leading-relaxed whitespace-pre-line text-[#3B2D21]">
              {s.story}
            </p>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl px-6 py-8 text-center">
          <p className="text-stone-500 italic">História em preparação com muito amor...</p>
        </section>
      )}

      {/* 2. SEÇÃO: ÁLBUM DE FOTOS */}
      {photos.length > 0 && (
        <section className="reveal mx-auto max-w-5xl px-6 py-10 sm:py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7c8d5b]/40" />
            <Lily className="h-6 w-6 text-[#7c8d5b]" />
            <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7c8d5b]/40" />
          </div>
          <h2 className="mb-4 font-script text-5xl text-[#47582e] sm:text-6xl md:text-7xl">
            Álbum de Fotos
          </h2>
          <p className="text-xs sm:text-sm text-[#5E4E41] max-w-md mx-auto mb-8">
            Deslize para ver alguns dos nossos momentos favoritos juntos
          </p>
          <Carousel photos={photos} />
        </section>
      )}

      {/* Ações de Navegação no Final da Página */}
      <div className="mx-auto max-w-xl px-6 py-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <Link
          href={inviteUrl}
          className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-[#47582e] bg-white px-7 py-3 font-caps text-xs tracking-widest text-[#47582e] font-bold shadow-xs transition hover:bg-[#47582e] hover:text-white hover:shadow-md"
        >
          <span>← VOLTAR AO MEU CONVITE</span>
        </Link>
        <Link
          href={giftsUrl}
          className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#47582e] px-7 py-3 font-caps text-xs tracking-widest text-white font-bold shadow-md transition hover:bg-[#394725] hover:shadow-lg"
        >
          <span>VER LISTA DE PRESENTES →</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="reveal px-6 py-16 text-center border-t border-stone-200/60 bg-[#FAF7F2]/60">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#7c8d5b]/40" />
          <Lily className="h-6 w-6 text-[#7c8d5b]" />
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#7c8d5b]/40" />
        </div>
        <p className="font-script text-4xl sm:text-5xl text-[#47582e]">{s.finalMessage || "Com carinho,"}</p>
        <p className="mt-2 font-script text-3xl sm:text-4xl text-[#2C221A]">{s.groomName} &amp; {s.brideName}</p>
      </footer>
    </main>
  );
}
