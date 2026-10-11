"use client";

import { useEffect, useMemo, useState } from "react";

type NavItem = {
  id: string;
  label: string;
};

type Props = {
  groomName?: string;
  brideName?: string;
  hasStory?: boolean;
  hasPhotos?: boolean;
  hasGifts?: boolean;
  hasFavors?: boolean;
};

export default function Navbar({
  groomName = "Gustavo",
  brideName = "Débora",
  hasStory = true,
  hasPhotos = true,
  hasGifts = true,
  hasFavors = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("inicio");

  const items: NavItem[] = useMemo(
    () => [
      { id: "inicio", label: "Início" },
      ...(hasStory ? [{ id: "historia", label: "História" }] : []),
      ...(hasPhotos ? [{ id: "album", label: "Álbum" }] : []),
      { id: "informacoes", label: "Informações" },
      ...(hasGifts ? [{ id: "presentes", label: "Presentes" }] : []),
      ...(hasFavors ? [{ id: "lembrancinhas", label: "Lembranças" }] : []),
      { id: "confirmacao", label: "Presença" },
      { id: "local", label: "Local" },
    ],
    [hasStory, hasPhotos, hasGifts, hasFavors]
  );

  useEffect(() => {
    const handleScroll = () => {
      // Aparece suavemente após 320px de rolagem (depois do topo do hero)
      const scrolled = window.scrollY > 320;
      setIsVisible(scrolled);

      // Detecta a seção ativa com base na rolagem
      const sections = items.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
      const scrollPos = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    if (id === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Navegação do convite"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 shadow-xs"
          : "-translate-y-full opacity-0 pointer-events-none"
      } border-b border-stone-200/80 bg-[#FAF7F2]/95 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Monograma / Nomes à esquerda */}
        <button
          type="button"
          onClick={() => scrollTo("inicio")}
          className="group flex items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] rounded-lg"
          title="Voltar ao início"
        >
          <span className="font-script text-2xl text-[#47582e] transition group-hover:scale-105 sm:text-3xl">
            {groomName} &amp; {brideName}
          </span>
        </button>

        {/* Links de navegação (desktop e tablet) */}
        <div className="hidden md:flex items-center gap-1">
          {items.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`rounded-full px-3.5 py-1.5 font-caps text-xs tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] ${
                  isActive
                    ? "bg-[#47582e] text-white shadow-xs font-semibold"
                    : "text-[#2C221A]/85 hover:bg-[#7c8d5b]/12 hover:text-[#47582e]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de pílulas deslizável para dispositivos móveis */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto px-4 pb-2.5 pt-0.5 no-scrollbar">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`shrink-0 rounded-full px-3 py-1 font-caps text-[0.68rem] tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] ${
                isActive
                  ? "bg-[#47582e] text-white shadow-xs font-bold"
                  : "bg-white/80 border border-stone-200/70 text-[#2C221A] hover:bg-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
