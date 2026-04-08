import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyReviewForm } from "@/components/property-review-form";
import { StarDisplay } from "@/components/star-rating";
import { createClient } from "@/lib/supabase/server";
import {
  categoryAverages,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  formatDate,
  ratingAverage,
} from "@/lib/ratings";

type ReviewRow = {
  id: number;
  yazar_adi: string;
  yorum_metni: string;
  tarih: string;
  ev_durumu_puan: number;
  isinma_puan: number;
  tesisat_puan: number;
  rutubet_puan: number;
  ses_yalitimi_puan: number;
  ev_sahibi_tutum_puan: number;
  deposito_puan: number;
  kira_artis_puan: number;
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);
  if (!Number.isFinite(propertyId)) {
    return { title: "Ev bulunamadı" };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { title: "Ev" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("adres, il, ilce, mahalle")
    .eq("id", propertyId)
    .maybeSingle();

  if (!data) {
    return { title: "Ev bulunamadı" };
  }

  return {
    title: `${data.adres} — Kiracı Yorum`,
    description: `${data.mahalle}, ${data.ilce} / ${data.il}`,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = Number(id);
  if (!Number.isFinite(propertyId)) {
    notFound();
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          `.env.local` içinde Supabase değişkenlerini tanımlayın.
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, adres, il, ilce, mahalle, created_at")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError || !property) {
    notFound();
  }

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(
      "id, yazar_adi, yorum_metni, tarih, ev_durumu_puan, ev_sahibi_puan, fiyat_puan, konum_puan, ses_yalitimi_puan",
    )
    .eq("ev_id", propertyId)
    .order("tarih", { ascending: false });

  const reviews = (reviewsData ?? []) as ReviewRow[];
  const total = reviews.length;
  const avgs = categoryAverages(reviews);
  const genelOrtalama =
    avgs !== null
      ? CATEGORY_KEYS.reduce((s, k) => s + avgs[k], 0) / CATEGORY_KEYS.length
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Ana sayfa
        </Link>
      </nav>

      <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {property.adres}
        </h1>
        <p className="mt-2 text-zinc-600">
          {property.mahalle}, {property.ilce} / {property.il}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-800">
            {total} yorum
          </span>
          {genelOrtalama !== null && (
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-900">
              <span>Genel ortalama:</span>
              <StarDisplay value={genelOrtalama} size="sm" />
              <span>{genelOrtalama.toFixed(1)} / 5</span>
            </div>
          )}
        </div>
      </header>

      {avgs && (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Kategori ortalamaları
          </h2>
          <ul className="mt-4 space-y-4">
            {CATEGORY_KEYS.map((key) => (
              <li
                key={key}
                className="flex flex-col gap-2 border-b border-zinc-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-zinc-800">
                  {CATEGORY_LABELS[key]}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <StarDisplay value={avgs[key]} size="md" />
                  <span className="text-sm tabular-nums text-zinc-600">
                    {avgs[key].toFixed(1)} / 5
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <PropertyReviewForm propertyId={propertyId} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">Tüm yorumlar</h2>
        <div className="mt-4 space-y-4">
          {reviews.length === 0 && (
            <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
              Bu ev için henüz yorum yok.
            </p>
          )}
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-zinc-900">{review.yazar_adi}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDate(review.tarih)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                  <span className="text-zinc-600">Ortalama</span>
                  <StarDisplay value={ratingAverage(review)} size="sm" />
                  <span className="font-medium tabular-nums text-zinc-900">
                    {ratingAverage(review).toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-700">{review.yorum_metni}</p>
              <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                {CATEGORY_KEYS.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-zinc-600">{CATEGORY_LABELS[key]}</span>
                    <div className="flex items-center gap-2">
                      <StarDisplay
                        value={review[key]}
                        size="sm"
                        className="shrink-0"
                      />
                      <span className="tabular-nums text-zinc-800">
                        {review[key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
