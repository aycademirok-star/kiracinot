export type RatingFields = {
  ev_durumu_puan: number;
  ev_sahibi_puan: number;
  fiyat_puan: number;
  konum_puan: number;
  ses_yalitimi_puan: number;
};

export const CATEGORY_KEYS = [
  "ev_durumu_puan",
  "ev_sahibi_puan",
  "fiyat_puan",
  "konum_puan",
  "ses_yalitimi_puan",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  ev_durumu_puan: "Ev durumu",
  ev_sahibi_puan: "Ev sahibi",
  fiyat_puan: "Fiyat",
  konum_puan: "Konum",
  ses_yalitimi_puan: "Ses yalıtımı",
};

export type CategoryAverages = Record<CategoryKey, number>;

export function categoryAverages(rows: RatingFields[]): CategoryAverages | null {
  if (rows.length === 0) return null;
  const n = rows.length;
  return {
    ev_durumu_puan:
      rows.reduce((s, r) => s + r.ev_durumu_puan, 0) / n,
    ev_sahibi_puan:
      rows.reduce((s, r) => s + r.ev_sahibi_puan, 0) / n,
    fiyat_puan: rows.reduce((s, r) => s + r.fiyat_puan, 0) / n,
    konum_puan: rows.reduce((s, r) => s + r.konum_puan, 0) / n,
    ses_yalitimi_puan:
      rows.reduce((s, r) => s + r.ses_yalitimi_puan, 0) / n,
  };
}

export function ratingAverage(review: RatingFields) {
  return (
    (review.ev_durumu_puan +
      review.ev_sahibi_puan +
      review.fiyat_puan +
      review.konum_puan +
      review.ses_yalitimi_puan) /
    5
  );
}

export function formatDate(input: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(
    new Date(input),
  );
}

export const REVIEWS_PAGE_SIZE = 8;
