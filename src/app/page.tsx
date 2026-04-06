"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, ratingAverage, REVIEWS_PAGE_SIZE } from "@/lib/ratings";

const API = "";

type SortKey = "avg_desc" | "avg_asc" | "count_desc";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "avg_desc", label: "Puan (yüksek → düşük)" },
  { value: "avg_asc", label: "Puan (düşük → yüksek)" },
  { value: "count_desc", label: "Yorum sayısı (çok → az)" },
];

export default function Home() {
  const supabase = createClient();

  const [iller, setIller] = useState<any[]>([]);
  const [ilceler, setIlceler] = useState<any[]>([]);
  const [mahalleler, setMahalleler] = useState<any[]>([]);

  const [ilId, setIlId] = useState<number | null>(null);
  const [ilAdi, setIlAdi] = useState("");
  const [ilceId, setIlceId] = useState<number | null>(null);
  const [ilceAdi, setIlceAdi] = useState("");
  const [mahalleAdi, setMahalleAdi] = useState("");
  const [sokakAdi, setSokakAdi] = useState("");
  const [apartman, setApartman] = useState("");

  const [sort, setSort] = useState<SortKey>("avg_desc");
  const [reviews, setReviews] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [illerYuklendi, setIllerYuklendi] = useState(false);

  useEffect(() => { fetchData(); }, [page, sort]);

  async function illeriYukle() {
    if (illerYuklendi) return;
    try {
      const res = await fetch(`/api/adres?tip=iller`);
      const json = await res.json();
      setIller(json.data ?? json);
      setIllerYuklendi(true);
    } catch {}
  }

  async function ilSecildi(id: number, adi: string) {
    setIlId(id); setIlAdi(adi);
    setIlceId(null); setIlceAdi("");
    setMahalleAdi(""); setSokakAdi("");
    setIlceler([]); setMahalleler([]);
    if (!id) return;
    try {
      const res = await fetch(`/api/adres?tip=ilceler&id=${id}`;
      const json = await res.json();
      const towns = json.data?.towns ?? json.towns ?? [];
      setIlceler(towns);
    } catch {}
  }

  async function ilceSecildi(id: number, adi: string) {
    setIlceId(id); setIlceAdi(adi);
    setMahalleAdi(""); setSokakAdi("");
    setMahalleler([]);
    if (!id) return;
    try {
      const res = await fetch(`/api/adres?tip=mahalleler&id=${id}`;
      const json = await res.json();
      const districts = json.data?.districts ?? json.districts ?? [];
      setMahalleler(districts);
    } catch {}
  }

  async function fetchData(resetPage = false) {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    const from = (currentPage - 1) * REVIEWS_PAGE_SIZE;
    const to = from + REVIEWS_PAGE_SIZE - 1;

    let rq = supabase
      .from("reviews")
      .select("id, yazar_adi, yorum_metni, tarih, ev_durumu_puan, ev_sahibi_puan, fiyat_puan, konum_puan, ses_yalitimi_puan, properties:ev_id(id, adres, il, ilce, mahalle)", { count: "exact" })
      .order("tarih", { ascending: false })
      .range(from, to);

    let pq = supabase
      .from("properties")
      .select("id, adres, il, ilce, mahalle, reviews(ev_durumu_puan, ev_sahibi_puan, fiyat_puan, konum_puan, ses_yalitimi_puan)")
      .limit(120);

    if (ilAdi) pq = pq.eq("il", ilAdi);
    if (ilceAdi) pq = pq.eq("ilce", ilceAdi);
    if (mahalleAdi) pq = pq.eq("mahalle", mahalleAdi);
    if (sokakAdi || apartman) {
      const q = [sokakAdi, apartman].filter(Boolean).join(" ");
      pq = pq.ilike("adres", `%${q}%`);
    }

    const [{ data: rd, count }, { data: pd }] = await Promise.all([rq, pq]);

    setTotalReviews(count ?? 0);
    setReviews(((rd ?? []) as any[]).map((r) => ({
      ...r,
      properties: r.properties?.[0] ?? null,
      ortalamaPuan: ratingAverage(r),
    })));

    let props = ((pd ?? []) as any[])
      .map((p) => {
        const rc = p.reviews.length;
        const total = p.reviews.reduce((s: number, r: any) => s + ratingAverage(r), 0);
        return { ...p, reviewCount: rc, ortalamaPuan: rc > 0 ? total / rc : 0 };
      })
      .filter((p) => p.reviewCount > 0);

    if (sort === "avg_desc") props.sort((a, b) => b.ortalamaPuan - a.ortalamaPuan);
    else if (sort === "avg_asc") props.sort((a, b) => a.ortalamaPuan - b.ortalamaPuan);
    else props.sort((a, b) => b.reviewCount - a.reviewCount);

    setProperties(props.slice(0, 18));
    setLoading(false);
  }

  const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEWS_PAGE_SIZE));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Kiracı Yorum</h1>
        <p className="mt-2 text-zinc-600">İl, ilçe, mahalle ve sokak seçerek ara.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">İl</label>
            <select value={ilId ?? ""} onFocus={illeriYukle} onClick={illeriYukle}
              onChange={(e) => {
                const id = Number(e.target.value);
                const adi = iller.find((i: any) => i._id === id)?.city ?? "";
                ilSecildi(id, adi);
              }}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2">
              <option value="">Seçiniz</option>
              {iller.map((i: any) => <option key={i._id} value={i._id}>{i.city}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-600">İlçe</label>
            <select value={ilceId ?? ""} disabled={!ilId}
              onChange={(e) => {
                const id = Number(e.target.value);
                const adi = ilceler.find((i: any) => i._id === id)?.name ?? "";
                ilceSecildi(id, adi);
              }}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
              <option value="">Seçiniz</option>
              {ilceler.map((i: any) => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-600">Mahalle</label>
            <select value={mahalleAdi} disabled={!ilceId}
              onChange={(e) => setMahalleAdi(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
              <option value="">Seçiniz</option>
              {mahalleler.map((m: any) => <option key={m._id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-600">Sokak</label>
            <input value={sokakAdi} onChange={(e) => setSokakAdi(e.target.value)}
              placeholder="Sokak adı"
              className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-600">Apartman No</label>
            <input value={apartman} onChange={(e) => setApartman(e.target.value)}
              placeholder="Örn: 12"
              className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-600">Sıralama</label>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={() => fetchData(true)} disabled={loading}
            className="h-11 rounded-xl bg-zinc-900 px-6 font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "Aranıyor..." : "Ara"}
          </button>
          <Link href="/yorum-ekle"
            className="h-11 rounded-xl border border-zinc-300 px-6 font-medium text-zinc-900 hover:bg-zinc-50 flex items-center">
            Yorum Bırak
          </Link>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Son Eklenen Yorumlar</h2>
          <p className="mt-1 text-sm text-zinc-500">Sayfa {page} / {totalPages} · Toplam {totalReviews} eşleşen yorum</p>
          <div className="mt-4 space-y-4">
            {reviews.length === 0 && (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">Bu arama için yorum bulunamadı.</p>
            )}
            {reviews.map((review) => {
              const inner = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-zinc-900">{review.yazar_adi}</p>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                      {review.ortalamaPuan.toFixed(1)} / 5
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {review.properties
                      ? `${review.properties.mahalle}, ${review.properties.ilce} / ${review.properties.il}`
                      : "Adres bilgisi yok"}
                  </p>
                  <p className="mt-3 text-sm text-zinc-700">{review.yorum_metni}</p>
                  <p className="mt-2 text-xs text-zinc-500">{formatDate(review.tarih)}</p>
                </>
              );
              if (review.properties) {
                return (
                  <Link key={review.id} href={`/ev/${review.properties.id}`}
                    className="block rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50">
                    {inner}
                  </Link>
                );
              }
              return <article key={review.id} className="rounded-xl border p-4">{inner}</article>;
            })}
          </div>
          {totalPages > 1 && (
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <button onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50">Önceki</button>
              )}
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50">Sonraki</button>
              )}
            </nav>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Ortalama Puanlar</h2>
          <p className="mt-1 text-sm text-zinc-500">Sıralama: {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "—"}</p>
          <div className="mt-4 space-y-3">
            {properties.length === 0 && (
              <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">Bu arama için puanlanmış ev bulunamadı.</p>
            )}
            {properties.map((property) => (
              <Link key={property.id} href={`/ev/${property.id}`}
                className="flex items-start justify-between gap-4 rounded-xl border p-4 transition hover:border-zinc-400 hover:bg-zinc-50">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{property.adres}</p>
                  <p className="text-sm text-zinc-600">{property.mahalle}, {property.ilce} / {property.il}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-zinc-900">{property.ortalamaPuan.toFixed(1)}</p>
                  <p className="text-xs text-zinc-500">{property.reviewCount} yorum</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
