"use client";

import Image from "next/image";
import { addPhotoToAlbum, deletePhoto, setCoverPhoto, movePhotoOrder } from "./actions";

type PhotoItem = {
  id: string;
  url: string;
  position: number;
  isCover: boolean;
};

export default function AlbumManager({ photos }: { photos: PhotoItem[] }) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900">Álbum de Fotos</h2>
        <p className="mt-1 text-xs text-slate-500">
          Adicione, ordene e escolha a foto de capa que aparecerá com prioridade no carrossel.
        </p>
      </div>

      {/* Formulário para adicionar nova foto */}
      <form action={addPhotoToAlbum} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-700">
            Adicionar foto (upload do arquivo)
          </label>
          <input
            type="file"
            name="photo"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#7c8d5b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#6b7a4d]"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-700">
            Ou URL externa da imagem
          </label>
          <input
            name="photoUrl"
            type="url"
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#7c8d5b] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-[#7c8d5b] px-4 py-2 font-caps text-xs tracking-wider text-white hover:bg-[#6b7a4d]"
        >
          Adicionar
        </button>
      </form>

      {/* Grid de fotos com ações */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {photos.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-slate-400">
            Nenhuma foto no álbum. Adicione uma foto acima.
          </p>
        ) : (
          photos.map((p, idx) => (
            <div
              key={p.id}
              className={`relative flex flex-col overflow-hidden rounded-xl border p-2 shadow-sm ${
                p.isCover ? "border-[#7c8d5b] ring-2 ring-[#7c8d5b]/30" : "border-slate-200"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={p.url}
                  alt={`Foto do álbum ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {p.isCover && (
                  <span className="absolute top-2 left-2 rounded-full bg-[#7c8d5b] px-2.5 py-0.5 text-[0.65rem] font-bold text-white shadow">
                    FOTO DE CAPA
                  </span>
                )}
              </div>

              {/* Ações */}
              <div className="mt-3 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <form action={movePhotoOrder}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={idx === 0}
                      title="Mover para a esquerda/cima"
                      className="rounded border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                    >
                      ←
                    </button>
                  </form>
                  <form action={movePhotoOrder}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={idx === photos.length - 1}
                      title="Mover para a direita/baixo"
                      className="rounded border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                    >
                      →
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-1">
                  {!p.isCover && (
                    <form action={setCoverPhoto}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50 text-[0.7rem]"
                      >
                        Definir capa
                      </button>
                    </form>
                  )}
                  <form action={deletePhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm("Excluir esta foto do álbum?")) e.preventDefault();
                      }}
                      className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 text-[0.7rem]"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
