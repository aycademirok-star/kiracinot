export type RatingFields = {
  ev_durumu_puan: number;
  isinma_puan: number;
  tesisat_puan: number;
  rutubet_puan: number;
  ses_yalitimi_puan: number;
  ev_sahibi_tutum_puan: number;
  deposito_puan: number;
  kira_artis_puan: number;
};

export const CATEGORY_KEYS = [
  "ev_durumu_puan",
  "isinma_puan",
  "tesisat_puan",
  "rutubet_puan",
  "ses_yalitimi_puan",
  "ev_sahibi_tutum_puan",
  "deposito_puan",
  "kira_artis_puan",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  ev_durumu_puan: "Ev Genel Durumu",
  isinma_puan: "Isınma Durumu",
  tesisat_puan: "Tesisat Durumu",
  rutubet_puan: "Rutubet Durumu",
  ses_yalitimi_puan: "Ses Yalıtımı",
  ev_sahibi_tutum_puan: "Ev Sahibi Tutumu",
  deposito_puan: "Deposito İadesi",
  kira_artis_puan: "Kira Artışına Yaklaşım",
};

export type CategoryAverages = Record<CategoryKey, number>;

export function categoryAverages(rows: RatingFields[]): CategoryAverages | null {
  if (rows.length === 0) return null;
  const n = rows.length;
  return {
    ev_durumu_puan: rows.reduce((s, r) => s + (r.ev_durumu_puan || 0), 0) / n,
    isinma_puan: rows.reduce((s, r) => s + (r.isinma_puan || 0), 0) / n,
    tesisat_puan: rows.reduce((s, r) => s + (r.tesisat_puan || 0), 0) / n,
    rutubet_puan: rows.reduce((s, r) => s + (r.rutubet_puan || 0), 0) / n,
    ses_yalitimi_puan: rows.reduce((s, r) => s + (r.ses_yalitimi_puan || 0), 0) / n,
    ev_sahibi_tutum_puan: rows.reduce((s, r) => s + (r.ev_sahibi_tutum_puan || 0), 0) / n,
    deposito_puan: rows.reduce((s, r) => s + (r.deposito_puan || 0), 0) / n,
    kira_artis_puan: rows.reduce((s, r) => s + (r.kira_artis_puan || 0), 0) / n,
  };
}

export function ratingAverage(review: RatingFields) {
  const toplam =
    (review.ev_durumu_puan || 0) +
    (review.isinma_puan || 0) +
    (review.tesisat_puan || 0) +
    (review.rutubet_puan || 0) +
    (review.ses_yalitimi_puan || 0) +
    (review.ev_sahibi_tutum_puan || 0) +
    (review.deposito_puan || 0) +
    (review.kira_artis_puan || 0);
  const dolu = [
    review.ev_durumu_puan,
    review.isinma_puan,
    review.tesisat_puan,
    review.rutubet_puan,
    review.ses_yalitimi_puan,
    review.ev_sahibi_tutum_puan,
    review.deposito_puan,
    review.kira_artis_puan,
  ].filter((v) => v && v > 0).length;
  return dolu > 0 ? toplam / dolu : 0;
}

export function formatDate(input: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(
    new Date(input),
  );
}

export const REVIEWS_PAGE_SIZE = 8;