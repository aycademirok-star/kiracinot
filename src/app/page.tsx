import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatDate,
  ratingAverage,
  REVIEWS_PAGE_SIZE,
} from "@/lib/ratings";

type SearchParams = Promise<{
  q?: string;
  sort?: string;
  page?: string;
}>;

type SortKey = "avg_desc" | "avg_asc" | "count_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "avg_desc", label: "Puan (yüksek → düşük)" },
  { value: "avg_asc", label: "Puan (düşük → yüksek)" },
  { value: "count_desc", label: "Yorum sayısı (çok → az)" },
];

type ReviewRow = {
  id: number;
  yazar_adi: string;
  yorum_metni: string;
  tarih: string;
  ev_durumu_puan: number;
  ev_sahibi_puan: number;
  fiyat_puan: number;
  konum_puan: number;
  ses_yalitimi_puan: number;
  properties: {
    id: number;
    adres: string;
    il: string;
    ilce: string;
    mahalle: string;
  }[] | null;
};

type PropertyAvgRow = {
  id: number;
  adres: string;
  il: string;
  ilce: string;
  mahalle: string;
  reviews: {
    ev_durumu_puan: number;
    ev_sahibi_puan: number;
    fiyat_puan: number;
    konum_puan: number;
    ses_yalitimi_puan: number;
  }[];
};

function parseSort(value: string | undefined): SortKey {
  if (value === "avg_asc" || value === "count_desc") return value;
  return "avg_desc";
}

function buildHomeHref(opts: {
  q: string;
  sort: SortKey;
  page: number;
}) {
  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  if (opts.sort !== "avg_desc") params.set("sort", opts.sort);
  if (opts.page > 1) params.set("page", String(opts.page));
  const s = params.toString();
  return s ? `/?${s}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const sort = parseSort(sp.sort);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const from = (page - 1) * REVIEWS_PAGE_SIZE;
  const to = from + REVIEWS_PAGE_SIZE - 1;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Kiracı Yorum</h1>
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          Veritabanından veri çekebilmek için `.env.local` dosyasında Supabase
          değişkenlerini tanımlayın.
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  let reviewsQuery = supabase
    .from("reviews")
    .select(
      "id, yazar_adi, yorum_metni, tarih, ev_durumu_puan, ev_sahibi_puan, fiyat_puan, konum_puan, ses_yalitimi_puan, properties:ev_id(id, adres, il, ilce, mahalle)",
      { count: "exact" },
    )
    .order("tarih", { ascending: false })
    .range(from, to);

  let propertiesQuery = supabase
    .from("properties")
    .select(
      "id, adres, il, ilce, mahalle, reviews(ev_durumu_puan, ev_sahibi_puan, fiyat_puan, konum_puan, ses_yalitimi_puan)",
    )
    .limit(120);

  if (query) {
    const escaped = query.replaceAll(",", " ");
    const filters = [
      `adres.ilike.%${escaped}%`,
      `il.ilike.%${escaped}%`,
      `ilce.ilike.%${escaped}%`,
      `mahalle.ilike.%${escaped}%`,
    ].join(",");

    propertiesQuery = propertiesQuery.or(filters);
    reviewsQuery = reviewsQuery.or(
      `properties.adres.ilike.%${escaped}%,properties.il.ilike.%${escaped}%,properties.ilce.ilike.%${escaped}%,properties.mahalle.ilike.%${escaped}%`,
      { referencedTable: "properties" },
    );
  }

  const [{ data: reviewsData, count: reviewsCount }, { data: propertiesData }] =
    await Promise.all([reviewsQuery, propertiesQuery]);

  const totalReviews = reviewsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEWS_PAGE_SIZE));

  const reviews = ((reviewsData ?? []) as ReviewRow[]).map((review) => {
    const property = review.properties?.[0] ?? null;
    return {
      ...review,
      properties: property,
      ortalamaPuan: ratingAverage(review),
    };
  });

  let properties = ((propertiesData ?? []) as PropertyAvgRow[])
    .map((property) => {
      const reviewCount = property.reviews.length;
      const total = property.reviews.reduce(
        (sum, review) => sum + ratingAverage(review),
        0,
      );
      return {
        ...property,
        reviewCount,
        ortalamaPuan: reviewCount > 0 ? total / reviewCount : 0,
      };
    })
    .filter((p) => p.reviewCount > 0);

  if (sort === "avg_desc") {
    properties = properties.sort((a, b) => b.ortalamaPuan - a.ortalamaPuan);
  } else if (sort === "avg_asc") {
    properties = properties.sort((a, b) => a.ortalamaPuan - b.ortalamaPuan);
  } else {
    properties = properties.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  properties = properties.slice(0, 18);

  const hrefPrev =
    page > 1
      ? buildHomeHref({ q: query, sort, page: page - 1 })
      : null;
  const hrefNext =
    page < totalPages
      ? buildHomeHref({ q: query, sort, page: page + 1 })
      : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Kiracı Yorum
        </h1>
        <p className="mt-2 text-zinc-600">
          Adres, il, ilçe, mahalle, sokak veya apartman numarası ile ara.
        </p>
        <form
          method="get"
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="sr-only">
              Arama
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Örn: Kadıköy Moda Caferağa Şair Nefi Sokak No 12"
              className="h-11 w-full rounded-xl border border-zinc-300 px-4 outline-none ring-blue-600 transition focus:ring-2"
            />
          </div>
          <div className="sm:w-56">
            <label htmlFor="sort" className="mb-1 block text-sm text-zinc-600">
              Ev listesi sıralama
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-11 rounded-xl bg-zinc-900 px-6 font-medium text-white hover:bg-zinc-700"
          >
            Ara
          </button>
        </form>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">
            Son Eklenen Yorumlar
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Sayfa {page} / {totalPages} · Toplam {totalReviews} eşleşen yorum
          </p>
          <div className="mt-4 space-y-4">
            {reviews.length === 0 && (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
                Bu arama için yorum bulunamadı.
              </p>
            )}
            {reviews.map((review) => {
              const inner = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-zinc-900">
                      {review.yazar_adi}
                    </p>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                      {review.ortalamaPuan.toFixed(1)} / 5
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {review.properties
                      ? `${review.properties.mahalle}, ${review.properties.ilce} / ${review.properties.il}`
                      : "Adres bilgisi yok"}
                  </p>
                  <p className="mt-3 text-sm text-zinc-700">
                    {review.yorum_metni}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDate(review.tarih)}
                  </p>
                </>
              );

              if (review.properties) {
                return (
                  <Link
                    key={review.id}
                    href={`/ev/${review.properties.id}`}
                    className="block rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <article key={review.id} className="rounded-xl border p-4">
                  {inner}
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
              aria-label="Yorum sayfaları"
            >
              {hrefPrev && (
                <Link
                  href={hrefPrev}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  Önceki
                </Link>
              )}
              {hrefNext && (
                <Link
                  href={hrefNext}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  Sonraki
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">
            Ortalama Puanlar
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Sıralama:{" "}
            {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "—"}
          </p>
          <div className="mt-4 space-y-3">
            {properties.length === 0 && (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
                Bu arama için puanlanmış ev bulunamadı.
              </p>
            )}
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/ev/${property.id}`}
                className="flex items-start justify-between gap-4 rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{property.adres}</p>
                  <p className="text-sm text-zinc-600">
                    {property.mahalle}, {property.ilce} / {property.il}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-zinc-900">
                    {property.ortalamaPuan.toFixed(1)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {property.reviewCount} yorum
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
