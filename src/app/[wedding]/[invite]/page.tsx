import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Countdown from "@/components/Countdown";
import Carousel from "@/components/Carousel";
import Navbar from "@/components/Navbar";
import { getPublicInvite } from "@/lib/invite-data";
import RsvpForm from "./RsvpForm";
import GiftsSection from "./GiftsSection";
import FavorsSection from "./FavorsSection";

export const dynamic = "force-dynamic";

type Params = { wedding: string; invite: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { wedding, invite } = await params;
  const data = await getPublicInvite(wedding, invite);
  if (!data) return { title: "Convite", robots: { index: false } };
  const names = `${data.settings.groomName} & ${data.settings.brideName}`;
  return {
    title: `${names} – Convite de casamento`,
    description: `${data.invitation.displayName}, você está convidado(a) para o casamento de ${names}.`,
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

function Section({ id, title, children, className = "" }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`reveal mx-auto max-w-4xl px-6 py-14 sm:py-20 text-center ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-2.5">
        <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7c8d5b]/40" />
        <Lily className="h-6 w-6 text-[#7c8d5b]" />
        <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7c8d5b]/40" />
      </div>
      <h2 className="font-script text-5xl text-[#47582e] sm:text-6xl md:text-7xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

const safeHttp = (u: string) => /^https?:\/\//i.test(u);

export default async function InvitePage({ params }: { params: Promise<Params> }) {
  const { wedding, invite } = await params;
  const data = await getPublicInvite(wedding, invite);
  if (!data) notFound();

  // Salva cookie para lembrar este convite caso o convidado recarregue ou volte à raiz
  try {
    const cookieStore = await cookies();
    cookieStore.set("gd_last_invite", `/${wedding}/${invite}`, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } catch {
    // ignorar
  }

  const { settings: s, invitation, photos, gifts, favors, favorAnswers, rsvp } = data;
  const eventDate = s.eventAt
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" }).format(s.eventAt)
    : null;
  const eventTime = s.eventAt
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(s.eventAt).replace(":", "h")
    : null;
  const mapsHref = safeHttp(s.mapsUrl)
    ? s.mapsUrl
    : s.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`
      : "";
  const embed = s.address ? `https://www.google.com/maps?q=${encodeURIComponent(`${s.venueName} ${s.address}`.trim())}&output=embed` : "";

  return (
    <main className="min-h-screen bg-cream text-ink antialiased">
      {/* Barra de navegação que surge suavemente ao rolar */}
      <Navbar
        groomName={s.groomName}
        brideName={s.brideName}
        hasStory={Boolean(s.story)}
        hasPhotos={photos.length > 0}
        hasGifts={gifts.length > 0 || Boolean(s.pixKey)}
        hasFavors={invitation.favorCount > 0 && favors.length > 0}
      />

      {/* 1. ABERTURA HERO */}
      <header id="inicio" className="relative flex min-h-screen items-center justify-center overflow-hidden text-center text-white">
        {s.heroPhotoUrl && (
          <Image src={s.heroPhotoUrl} alt={`${s.groomName} e ${s.brideName}`} fill priority sizes="100vw" className="object-cover object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-[#1a140e]/45 to-black/75" />
        <div className="reveal relative z-10 flex w-full max-w-3xl flex-col items-center gap-7 px-6 py-20">
          <h1 className="font-script text-7xl leading-[0.95] drop-shadow-md sm:text-8xl md:text-9xl text-white">
            {s.groomName}
            <span className="block text-5xl sm:text-6xl md:text-7xl text-amber-200/90">&amp;</span>
            {s.brideName}
          </h1>

          <Countdown eventAt={s.eventAt ? s.eventAt.toISOString() : null} />

          {(eventDate || s.address || s.dressCode) && (
            <div className="mt-2 flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-black/25 px-6 py-4 backdrop-blur-md text-white/95 drop-shadow sm:px-8">
              {eventDate && (
                <p className="font-caps text-sm tracking-[0.25em] uppercase font-semibold text-amber-200/95 sm:text-base">
                  {eventDate}{eventTime ? ` · ${eventTime}` : ""}
                </p>
              )}
              {(s.venueName || s.address) && (
                <p className="text-xs sm:text-sm text-white/90">
                  {[s.venueName, s.address].filter(Boolean).join(" — ")}
                </p>
              )}
              {s.dressCode && (
                <p className="font-caps text-[0.72rem] tracking-widest uppercase text-white/80 sm:text-xs">
                  Traje: {s.dressCode}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 2. MENSAGEM INICIAL */}
      {s.welcomeMessage && (
        <Section id="mensagem" title={`Olá, ${invitation.displayName}`}>
          <div className="relative mx-auto max-w-2xl rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-xs backdrop-blur-xs sm:p-10">
            <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-[#2C221A]">
              {s.welcomeMessage}
            </p>
          </div>
        </Section>
      )}

      {/* 3. NOSSA HISTÓRIA */}
      {s.story && (
        <div className="relative py-2 sm:py-4">
          <Section id="historia" title="Nossa História">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-b from-white/95 to-[#FAF6F0]/90 p-8 shadow-sm text-center sm:p-12">
              <span className="pointer-events-none absolute -top-5 left-6 font-serif text-8xl text-[#7c8d5b]/12 select-none">“</span>
              <p className="relative z-10 text-base sm:text-lg leading-relaxed whitespace-pre-line text-[#3B2D21]">
                {s.story}
              </p>
            </div>
          </Section>
        </div>
      )}

      {/* 4. ÁLBUM DE FOTOS */}
      {photos.length > 0 && (
        <div className="relative py-4 sm:py-8 bg-gradient-to-b from-transparent via-[#F1F5EB]/50 to-transparent">
          <section id="album" className="reveal mx-auto max-w-5xl px-6 py-12 sm:py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7c8d5b]/40" />
              <Lily className="h-6 w-6 text-[#7c8d5b]" />
              <span className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7c8d5b]/40" />
            </div>
            <h2 className="mb-8 font-script text-5xl text-[#47582e] sm:text-6xl md:text-7xl">Álbum</h2>
            <Carousel photos={photos} />
          </section>
        </div>
      )}

      {/* 5. INFORMAÇÕES DO CASAMENTO (Cards Modernos e Altamente Legíveis) */}
      <Section id="informacoes" title="Informações">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 text-center">
          {/* Card Data & Hora */}
          {(eventDate || eventTime) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200/80 bg-white/85 p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7c8d5b]/12 text-[#47582e]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-caps text-[0.72rem] tracking-[0.25em] text-[#47582e] uppercase font-bold">Quando</span>
              {eventDate && <p className="mt-1.5 text-base font-semibold text-[#2C221A] sm:text-lg">{eventDate}</p>}
              {eventTime && <p className="mt-0.5 text-sm text-[#5E4E41]">às {eventTime}</p>}
            </div>
          )}

          {/* Card Local & Endereço */}
          {(s.venueName || s.address) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200/80 bg-white/85 p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7c8d5b]/12 text-[#47582e]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-caps text-[0.72rem] tracking-[0.25em] text-[#47582e] uppercase font-bold">Onde</span>
              {s.venueName && <p className="mt-1.5 text-base font-semibold text-[#2C221A] sm:text-lg">{s.venueName}</p>}
              {s.address && <p className="mt-0.5 text-xs text-[#5E4E41] line-clamp-2">{s.address}</p>}
            </div>
          )}

          {/* Card Traje */}
          {s.dressCode && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200/80 bg-white/85 p-6 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 sm:col-span-2 md:col-span-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7c8d5b]/12 text-[#47582e]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="font-caps text-[0.72rem] tracking-[0.25em] text-[#47582e] uppercase font-bold">Dress Code</span>
              <p className="mt-1.5 text-base font-semibold text-[#2C221A] sm:text-lg">{s.dressCode}</p>
              <p className="mt-0.5 text-xs text-[#5E4E41]">Elegante e confortável</p>
            </div>
          )}
        </div>
      </Section>

      {/* 6. LISTA DE PRESENTES + PIX */}
      {(gifts.length > 0 || s.pixKey) && (
        <Section id="presentes" title="Lista de Presentes">
          <GiftsSection
            weddingSlug={data.wedding.slug}
            inviteSlug={invitation.slug}
            gifts={gifts}
            pixKey={s.pixKey}
          />
        </Section>
      )}

      {/* 7. LEMBRANCINHAS */}
      {invitation.favorCount > 0 && favors.length > 0 && (
        <Section id="lembrancinhas" title="Lembrancinhas">
          <FavorsSection
            weddingSlug={data.wedding.slug}
            inviteSlug={invitation.slug}
            favorCount={invitation.favorCount}
            favors={favors}
            savedAnswers={favorAnswers}
          />
        </Section>
      )}

      {/* 8. CONFIRMAÇÃO DE PRESENÇA */}
      <Section id="confirmacao" title="Confirmação de Presença">
        <RsvpForm
          weddingSlug={data.wedding.slug}
          inviteSlug={invitation.slug}
          type={invitation.type}
          max={invitation.maxGuests}
          initial={rsvp}
          intro={s.rsvpMessage}
        />
      </Section>

      {/* 9. LOCAL / MAPA */}
      {(s.address || mapsHref) && (
        <Section id="local" title="Local">
          <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200/80 bg-white/85 p-6 sm:p-8 shadow-xs">
            {s.venueName && <p className="font-caps text-xl font-bold tracking-wide text-[#2C221A] sm:text-2xl">{s.venueName}</p>}
            {s.address && <p className="mt-1.5 text-sm sm:text-base text-[#5E4E41]">{s.address}</p>}
            {embed && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200/80 shadow-md">
                <iframe
                  title="Mapa do local do casamento"
                  src={embed}
                  className="h-72 w-full border-0 sm:h-96"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            {mapsHref && (
              <div className="mt-6">
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#47582e] px-8 py-3.5 font-caps text-xs tracking-widest text-white shadow-md transition-all duration-200 hover:bg-[#394725] hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47582e]"
                >
                  <span>ABRIR NO GOOGLE MAPS</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* 10. MENSAGEM FINAL */}
      <footer className="reveal px-6 py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#7c8d5b]/40" />
          <Lily className="h-6 w-6 text-[#7c8d5b]" />
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#7c8d5b]/40" />
        </div>
        <p className="font-script text-5xl text-[#47582e] sm:text-6xl">{s.finalMessage || "Com carinho,"}</p>
        <p className="mt-3 font-script text-4xl sm:text-5xl text-[#2C221A]">{s.groomName} &amp; {s.brideName}</p>
      </footer>
    </main>
  );
}
