export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  amountCents: number; // in paise (INR)
  blurb: string;
};

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "Starter", credits: 50, amountCents: 49900, blurb: "For side projects and quick jobs." },
  { id: "pro", name: "Pro", credits: 250, amountCents: 199900, blurb: "Best value for growing stores." },
  { id: "studio", name: "Studio", credits: 1000, amountCents: 699900, blurb: "High volume batch processing." },
];

export const formatInr = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
