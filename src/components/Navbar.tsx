"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PageTab = "convite" | "historia" | "presentes";

type Props = {
  groomName?: string;
  brideName?: string;
  currentPage?: PageTab;
  inviteUrl?: string;
  storyUrl?: string;
  giftsUrl?: string;
  alwaysVisible?: boolean;
};

export default function Navbar({
  groomName = "Gustavo",
  brideName = "Débora",
  currentPage = "convite",
  inviteUrl,
  storyUrl,
  giftsUrl,
  alwaysVisible = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(alwaysVisible);
  const [resolvedInviteUrl, setResolvedInviteUrl] = useState(inviteUrl || "/");

  // Se inviteUrl não foi passado explicitamente, tenta ler do cookie salvo no navegador
  useEffect(() => {
    if (inviteUrl) {
      setResolvedInviteUrl(inviteUrl);
      return;
    }
    try {
      const match = document.cookie.match(/(?:^|;\s*)gd_last_invite=([^;]+)/);
      if (match && match[1]) {
        setResolvedInviteUrl(decodeURIComponent(match[1]));
      }
    } catch {
      // fallback para "/"
    }
  }, [inviteUrl]);

  useEffect(() => {
    if (alwaysVisible) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      // No convite com hero alto, surge suavemente após rolagem
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [alwaysVisible]);

  const targetStoryUrl = storyUrl || (resolvedInviteUrl !== "/" ? `${resolvedInviteUrl.replace(/\/[^/]+$/, "")}/historia` : "/historia");
  const targetGiftsUrl = giftsUrl || (resolvedInviteUrl !== "/" ? `${resolvedInviteUrl.replace(/\/[^/]+$/, "")}/presentes` : "/presentes");

  const tabs: { id: PageTab; label: string; href: string }[] = [
    {
      id: "convite",
      label: "Convite",
      href: resolvedInviteUrl,
    },
    {
      id: "historia",
      label: "Nossa História",
      href: targetStoryUrl,
    },
    {
      id: "presentes",
      label: "Lista de Presentes",
      href: targetGiftsUrl,
    },
  ];

  const handleTabClick = (tabId: PageTab, href: string, e: React.MouseEvent) => {
    if (tabId === currentPage) {
      // Se já está na página atual, rola suavemente para o topo
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Navegação dos convidados"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 shadow-xs"
          : "-translate-y-full opacity-0 pointer-events-none"
      } border-b border-stone-200/80 bg-[#FAF7F2]/95 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Monograma / Nomes à esquerda */}
        <Link
          href={resolvedInviteUrl}
          onClick={(e) => {
            if (currentPage === "convite") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="group flex items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] rounded-lg"
          title="Voltar ao início do convite"
        >
          <span className="font-script text-2xl text-[#47582e] transition group-hover:scale-105 sm:text-3xl">
            {groomName} &amp; {brideName}
          </span>
        </Link>

        {/* Links de navegação para Desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = currentPage === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={(e) => handleTabClick(tab.id, tab.href, e)}
                className={`rounded-full px-4 py-1.5 font-caps text-xs tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] ${
                  isActive
                    ? "bg-[#47582e] text-white shadow-xs font-semibold"
                    : "text-[#2C221A]/85 hover:bg-[#7c8d5b]/12 hover:text-[#47582e]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Barra de 3 abas para telas Mobile (centralizada e de fácil toque) */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 px-3 pb-2.5 pt-0.5">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleTabClick(tab.id, tab.href, e)}
              className={`flex-1 text-center truncate rounded-full px-2.5 py-1.5 font-caps text-[0.68rem] tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c8d5b] ${
                isActive
                  ? "bg-[#47582e] text-white shadow-xs font-bold"
                  : "bg-white/80 border border-stone-200/70 text-[#2C221A] hover:bg-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
