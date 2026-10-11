export const INVITATION_TYPES = ["INDIVIDUAL", "PLUS_ONE", "COUPLE", "FAMILY"] as const;
export type InvitationType = (typeof INVITATION_TYPES)[number];

export const TYPE_LABEL: Record<InvitationType, string> = {
  INDIVIDUAL: "Individual",
  PLUS_ONE: "Individual + acompanhante",
  COUPLE: "Casal",
  FAMILY: "Família",
};

/** Limite de pessoas por tipo. Só FAMILY usa o valor definido pelo casal. */
export function limitFor(type: InvitationType, familyMax?: number) {
  switch (type) {
    case "INDIVIDUAL":
      return 1;
    case "PLUS_ONE":
    case "COUPLE":
      return 2;
    case "FAMILY":
      return Math.max(1, Math.floor(familyMax ?? 1));
  }
}

export const CHILD_AGE_NOTICE =
  "Considere como criança quem tem até 12 anos. A partir de 13 anos, a pessoa deve ser considerada adulta.";

export type RsvpInput = { status: "CONFIRMED" | "DECLINED"; adults: number; children: number };

/** Valida RSVP contra o limite do convite. Usada no servidor (e espelhada no cliente). */
export function validateRsvp(input: RsvpInput, max: number): string | null {
  if (input.status === "DECLINED") return null;
  const { adults, children } = input;
  if (!Number.isInteger(adults) || !Number.isInteger(children)) return "Quantidades inválidas.";
  if (adults < 0 || children < 0) return "Quantidades não podem ser negativas.";
  if (adults + children < 1) return "Informe ao menos uma pessoa.";
  if (adults + children > max) return `Este convite permite no máximo ${max} ${max === 1 ? "pessoa" : "pessoas"}.`;
  return null;
}

export type EventPhase = "FUTURE" | "TODAY" | "PAST";

export function eventPhase(eventAt: Date | null, now = new Date()): EventPhase {
  if (!eventAt) return "FUTURE";
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const a = fmt(eventAt);
  const b = fmt(now);
  if (a === b) return "TODAY";
  return eventAt.getTime() > now.getTime() ? "FUTURE" : "PAST";
}
