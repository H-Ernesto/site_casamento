"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  coupleName: string;
  username: string;
  logoutAction: () => Promise<void>;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Visão geral",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/convites",
    label: "Convites",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/lembrancinhas",
    label: "Lembrancinhas",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    href: "/admin/presentes",
    label: "Lista de presentes",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ coupleName, username, logoutAction }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Barra superior no mobile */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7c8d5b]">Casamento</span>
          <p className="text-sm font-semibold text-slate-800">{coupleName}</p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Overlay no mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR DESKTOP & MOBILE DRAWER */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 flex transition-all duration-300 ease-in-out ${
          // No mobile usa gaveta controlada por estado
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Painel da Barra Lateral */}
        <aside
          className={`flex flex-col justify-center min-h-screen border-r border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out ${
            // Em desktop, quando passar o mouse por cima (ou na área), ela expande/aparece para 260px; caso contrário fica numa alça discreta
            isHovered
              ? "w-64 opacity-100"
              : "md:w-16 md:opacity-90 w-64"
          }`}
        >
          {/* Conteúdo Centralizado Verticalmente */}
          <div className="flex flex-col justify-between h-full py-8 px-3">
            {/* Topo: Identificação do Casamento */}
            <div className={`transition-all duration-200 ${isHovered ? "px-2" : "md:px-0 text-center"}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#7c8d5b] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  GD
                </div>
                {isHovered && (
                  <div className="overflow-hidden whitespace-nowrap transition-opacity duration-200">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-[#7c8d5b]">Painel dos Noivos</p>
                    <p className="font-semibold text-slate-800 text-sm truncate">{coupleName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Centro: Itens de Navegação Centralizados Verticalmente */}
            <nav className="my-auto space-y-2 py-6" aria-label="Navegação do painel">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#7c8d5b] text-white shadow-sm font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    title={!isHovered ? item.label : undefined}
                  >
                    <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-[#7c8d5b]"}`}>
                      {item.icon}
                    </span>
                    {isHovered && (
                      <span className="whitespace-nowrap overflow-hidden transition-opacity duration-200">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Base: Perfil e Logout */}
            <div className="border-t border-slate-100 pt-4">
              {isHovered && (
                <div className="mb-2 px-3">
                  <p className="text-[11px] text-slate-400">Conectado como</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{username}</p>
                </div>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 transition ${
                    !isHovered ? "justify-center md:px-0" : ""
                  }`}
                  title={!isHovered ? "Sair da conta" : undefined}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isHovered && <span className="whitespace-nowrap">Sair</span>}
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Indicador sutil de hover/aba lateral em desktop */}
        <div
          className={`hidden md:flex items-center justify-center cursor-pointer transition-opacity duration-200 ${
            isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="h-16 w-1 rounded-r-full bg-[#7c8d5b]/60 my-auto shadow-sm" />
        </div>
      </div>
    </>
  );
}
