"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function Carousel({ photos }: { photos: { id: string; url: string }[] }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const n = photos.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  if (n === 0) return null;

  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-[#2C221A] shadow-md border border-stone-200/70 backdrop-blur-xs transition hover:bg-white hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7c8d5b] focus-visible:outline-none";

  return (
    <div
      className="relative mx-auto max-w-3xl"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Álbum de fotos"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(i - 1);
        if (e.key === "ArrowRight") go(i + 1);
      }}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-stone-200/80 shadow-xl sm:aspect-[3/2]"
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
          startX.current = null;
        }}
      >
        <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {photos.map((p, idx) => (
            <div key={p.id} className="relative h-full w-full shrink-0" aria-hidden={idx !== i}>
              <Image
                src={p.url}
                alt={`Foto ${idx + 1} de ${n} do álbum de Gustavo e Débora`}
                fill
                sizes="(min-width: 768px) 48rem, 100vw"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Contador discreto no canto inferior direito */}
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-3 py-1 font-caps text-[0.65rem] tracking-widest text-white backdrop-blur-md">
          {i + 1} / {n}
        </div>
      </div>

      {n > 1 && (
        <>
          <button type="button" aria-label="Foto anterior" onClick={() => go(i - 1)} className={`${arrow} left-3 sm:-left-5`}>‹</button>
          <button type="button" aria-label="Próxima foto" onClick={() => go(i + 1)} className={`${arrow} right-3 sm:-right-5`}>›</button>
          <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Escolher foto">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={`Ir para a foto ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === i ? "w-6 bg-[#47582e]" : "w-2 bg-[#7c8d5b]/30 hover:bg-[#7c8d5b]/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
