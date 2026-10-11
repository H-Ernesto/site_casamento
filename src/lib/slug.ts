import { randomBytes } from "node:crypto";

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Slug legível + sufixo aleatório: bonito na URL, mas não adivinhável. Ex.: joao-maria-k7x9q2 */
export function invitationSlug(displayName: string) {
  const base = slugify(displayName) || "convite";
  const token = randomBytes(4).toString("hex").slice(0, 6);
  return `${base}-${token}`;
}
