"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, ratingAverage, REVIEWS_PAGE_SIZE } from "@/lib/ratings";

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
  const [daireNo, setDaireNo] = useState("");

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
      const res = await fetch("/api/adres?tip=iller");
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
      const res = await fetch("/api/adres?tip=ilceler&id=" + id);
      const json = await res.json();
      setIlceler(json.data?.towns ?? json.towns ?? []);
    } catch {}
  }

  async function ilceSecildi(id: number, adi: string) {
    setIlceId(id); setIlceAdi(adi);
    setMahalleAdi(""); setSokakAdi("");
    setMahalleler([]);
    if (!id) return;
    try {
      const res = await fetch("/api/adres?tip=mahalleler&id=" + id);
      const json = await res.json();
      setMahalleler(json.data?.districts ?? json.districts ?? []);
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
      .select("id, yazar_adi, yorum_metni, tarih, ev_durumu_puan, ev_sahibi_tutum_puan, isinma_puan, tesisat_puan, rutubet_puan, ses_yalitimi_puan, deposito_puan, kira_artis_puan, properties:ev_id(id, adres, il, ilce, mahalle)", { count: "exact" })
      .eq("onaylandi", true)
      .order("tarih", { ascending: false })
      .range(from, to);

    let pq = supabase
      .from("properties")
      .select("id, adres, il, ilce, mahalle, reviews(ev_durumu_puan, ev_sahibi_tutum_puan, isinma_puan, tesisat_puan, rutubet_puan, ses_yalitimi_puan, deposito_puan, kira_artis_puan)")
      .limit(120);

    if (ilAdi) pq = pq.eq("il", ilAdi);
    if (ilceAdi) pq = pq.eq("ilce", ilceAdi);
    if (mahalleAdi) pq = pq.eq("mahalle", mahalleAdi);
    if (sokakAdi || apartman) {
      const q = [sokakAdi, apartman].filter(Boolean).join(" ");
      pq = pq.ilike("adres", "%" + q + "%");
    }

    const [{ data: rd, count }, { data: pd }] = await Promise.all([rq, pq]);

    setTotalReviews(count ?? 0);
    setReviews(((rd ?? []) as any[]).map((r) => ({
      ...r,
      properties: Array.isArray(r.properties) ? r.properties?.[0] ?? null : r.properties ?? null,
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

  const selectClass = "h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm outline-none ring-blue-400 focus:ring-2 focus:border-blue-400 transition disabled:opacity-50 disabled:bg-gray-50";
  const inputClass = "h-11 w-full rounded-xl border border-blue-100 px-4 text-sm outline-none ring-blue-400 focus:ring-2 focus:border-blue-400 transition";

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white text-xl">🏠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 tracking-tight">Kiracı Yorum</h1>
              <p className="text-xs text-blue-400">Kiracıların sesi</p>
            </div>
          </div>
          <Link href="/yorum-ekle"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
            + Yorum Bırak
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">

        {/* Hero Arama */}
        <section className="rounded-3xl bg-white shadow-xl border border-blue-100 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Ev Ara</h2>
            <p className="mt-1 text-blue-400 text-sm">İl, ilçe ve mahalle seçerek yorumları filtrele</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-700 uppercase tracking-wide">İl</label>
              <select value={ilId ?? ""} onFocus={illeriYukle} onClick={illeriYukle}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = iller.find((i: any) => i._id === id)?.city ?? "";
                  ilSecildi(id, adi);
                }}
                className={selectClass}>
                <option value="">Seçiniz</option>
                {iller.map((i: any) => <option key={i._id} value={i._id}>{i.city}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-700 uppercase tracking-wide">İlçe</label>
              <select value={ilceId ?? ""} disabled={!ilId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = ilceler.find((i: any) => i._id === id)?.name ?? "";
                  ilceSecildi(id, adi);
                }}
                className={selectClass}>
                <option value="">Seçiniz</option>
                {ilceler.map((i: any) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-700 uppercase tracking-wide">Mahalle</label>
              <select value={mahalleAdi} disabled={!ilceId}
                onChange={(e) => setMahalleAdi(e.target.value)}
                className={selectClass}>
                <option value="">Seçiniz</option>
                {mahalleler.map((m: any) => <option key={m._id} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-700 uppercase tracking-wide">Sokak</label>
              <input value={sokakAdi} onChange={(e) => setSokakAdi(e.target.value)}
                placeholder="Sokak adı" className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-700 uppercase tracking-wide">Apartman No</label>
              <input value={apartman} onChange={(e) => setApartman(e.target.value)}
                placeholder="Örn: 12" className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-700 uppercase tracking-wide">Daire No</label>
              <input value={daireNo} onChange={(e) => setDaireNo(e.target.value)}
                placeholder="Örn: 5" className={inputClass} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => fetchData(true)} disabled={loading}
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? "Aranıyor..." : "🔍 Yorum Ara"}
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none ring-blue-400 focus:ring-2 transition">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </section>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Toplam Yorum", value: totalReviews, icon: "💬" },
            { label: "Değerlendirilen Ev", value: properties.length, icon: "🏘️" },
            { label: "Aktif İl", value: "81", icon: "📍" },
            { label: "Ücretsiz", value: "Her Zaman", icon: "✨" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-blue-900">{stat.value}</div>
              <div className="text-xs text-blue-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Yorumlar ve Puanlar */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Son Yorumlar */}
          <div className="rounded-3xl bg-white border border-blue-100 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💬</span>
              <div>
                <h2 className="text-lg font-bold text-blue-900">Son Eklenen Yorumlar</h2>
                <p className="text-xs text-blue-400">Sayfa {page}/{totalPages} · {totalReviews} yorum</p>
              </div>
            </div>
            <div className="space-y-3">
              {reviews.length === 0 && (
                <div className="rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-blue-400 text-sm">Bu arama için yorum bulunamadı.</p>
                </div>
              )}
              {reviews.map((review) => {
                const inner = (
                  <div className="rounded-2xl border border-blue-50 bg-blue-50/50 p-4 hover:bg-blue-50 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {review.yazar_adi?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-semibold text-blue-900 text-sm">{review.yazar_adi}</p>
                      </div>
                      <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                        {review.ortalamaPuan.toFixed(1)} ★
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-blue-400">
                      📍 {review.properties
                        ? review.properties.adres + ", " + review.properties.mahalle + ", " + review.properties.ilce + " / " + review.properties.il
                        : "Adres bilgisi yok"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-700 line-clamp-2">{review.yorum_metni}</p>
                    <p className="mt-2 text-xs text-blue-300">{formatDate(review.tarih)}</p>
                  </div>
                );
                if (review.properties) {
                  return <Link key={review.id} href={"/ev/" + review.properties.id}>{inner}</Link>;
                }
                return <div key={review.id}>{inner}</div>;
              })}
            </div>
            {totalPages > 1 && (
              <nav className="mt-4 flex justify-center gap-2">
                {page > 1 && (
                  <button onClick={() => setPage(page - 1)}
                    className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition">
                    ← Önceki
                  </button>
                )}
                {page < totalPages && (
                  <button onClick={() => setPage(page + 1)}
                    className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition">
                    Sonraki →
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Ortalama Puanlar */}
          <div className="rounded-3xl bg-white border border-blue-100 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏆</span>
              <div>
                <h2 className="text-lg font-bold text-blue-900">Ortalama Puanlar</h2>
                <p className="text-xs text-blue-400">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</p>
              </div>
            </div>
            <div className="space-y-3">
              {properties.length === 0 && (
                <div className="rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-blue-400 text-sm">Bu arama için puanlanmış ev bulunamadı.</p>
                </div>
              )}
              {properties.map((property) => (
                <Link key={property.id} href={"/ev/" + property.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-blue-50 bg-blue-50/50 p-4 hover:bg-blue-50 hover:border-blue-200 transition-all">
                  <div className="min-w-0">
                    <p className="font-semibold text-blue-900 text-sm truncate">{property.adres}</p>
                    <p className="text-xs text-blue-400 mt-0.5">📍 {property.mahalle}, {property.ilce} / {property.il}</p>
                    <p className="text-xs text-blue-300 mt-0.5">{property.reviewCount} yorum</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">{property.ortalamaPuan.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-blue-300">
          Kiracı Yorum © 2026 · Tüm yorumlar gerçek kiracılara aittir
        </footer>
      </div>
    </main>
  );
}