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

  const selectClass = "h-11 w-full rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-3 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50 transition disabled:opacity-50";
  const inputClass = "h-11 w-full rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-4 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50 transition";

  return (
    <main className="min-h-screen" style={{backgroundColor:"#fdf8f3"}}>

      {/* NAVBAR */}
      <nav style={{backgroundColor:"#f97316"}} className="text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{backgroundColor:"rgba(255,255,255,0.2)"}}>🏠</div>
            <div>
              <span className="font-bold text-lg tracking-tight">Kiracı Yorum</span>
              <p className="text-xs leading-none" style={{color:"#ffd4b8"}}>Kiracıların sesi</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#yorumlar" className="hover:text-white transition" style={{color:"#ffd4b8"}}>Son Yorumlar</a>
            <a href="#puanlar" className="hover:text-white transition" style={{color:"#ffd4b8"}}>Puanlamaya Göre</a>
          </div>
          <Link href="/yorum-ekle"
            className="rounded-lg px-4 py-2 text-sm font-bold transition shadow"
            style={{backgroundColor:"white", color:"#c2440e"}}>
            + Yorum Bırak
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-[580px] overflow-hidden">
        <img src="/hero.jpg" alt="Kiracı Yorum" className="absolute inset-0 w-full h-full object-cover object-bottom" />
        <div className="absolute inset-0" style={{backgroundColor:"rgba(255,200,150,0.35)"}} />

        <div className="relative h-full flex flex-col justify-center pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
            Taşınmadan Önce <br />
            <span style={{color:"#ffd4b8"}}>Oku!</span>
          </h1>
          <p className="mt-4 text-lg max-w-xl leading-relaxed" style={{color:"#ffe8d6"}}>
            Gerçek kiracıların yorumlarını oku, ev sahibini ve yaşam koşullarını öğren.
            Güvenli bir yuva için doğru kararı ver.
          </p>
          <Link href="/yorum-ekle"
            className="mt-6 rounded-xl text-white font-bold text-base shadow-xl transition"
style={{backgroundColor:"#e85d04", display:"inline-block", padding:"12px 32px", width:"fit-content"}}>
          
          Deneyimini Paylaş →
          </Link>
        </div>

        {/* ARAMA ÇUBUĞU */}
        <div className="absolute bottom-0 left-0 right-0 py-4 px-4 sm:px-6 lg:px-8" style={{backgroundColor:"rgba(249,115,22,0.92)"}}>
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:"#ffd4b8"}}>Adrese Göre Yorum Ara</p>
            <div className="flex flex-wrap gap-3 items-end">
              <select value={ilId ?? ""} onFocus={illeriYukle} onClick={illeriYukle}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = iller.find((i: any) => i._id === id)?.city ?? "";
                  ilSecildi(id, adi);
                }}
                className={selectClass} style={{minWidth:"130px", flex:"1"}}>
                <option value="" className="text-gray-800">İl seçiniz</option>
                {iller.map((i: any) => <option key={i._id} value={i._id} className="text-gray-800">{i.city}</option>)}
              </select>

              <select value={ilceId ?? ""} disabled={!ilId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = ilceler.find((i: any) => i._id === id)?.name ?? "";
                  ilceSecildi(id, adi);
                }}
                className={selectClass} style={{minWidth:"130px", flex:"1"}}>
                <option value="" className="text-gray-800">İlçe seçiniz</option>
                {ilceler.map((i: any) => <option key={i._id} value={i._id} className="text-gray-800">{i.name}</option>)}
              </select>

              <select value={mahalleAdi} disabled={!ilceId}
                onChange={(e) => setMahalleAdi(e.target.value)}
                className={selectClass} style={{minWidth:"130px", flex:"1"}}>
                <option value="" className="text-gray-800">Mahalle seçiniz</option>
                {mahalleler.map((m: any) => <option key={m._id} value={m.name} className="text-gray-800">{m.name}</option>)}
              </select>

              <input value={sokakAdi} onChange={(e) => setSokakAdi(e.target.value)}
                placeholder="Sokak" className={inputClass} style={{minWidth:"100px", flex:"0.8"}} />

              <input value={apartman} onChange={(e) => setApartman(e.target.value)}
                placeholder="Apt No" className={inputClass} style={{minWidth:"80px", flex:"0.6"}} />

              <input value={daireNo} onChange={(e) => setDaireNo(e.target.value)}
                placeholder="Daire No" className={inputClass} style={{minWidth:"80px", flex:"0.6"}} />

              <button onClick={() => fetchData(true)} disabled={loading}
                className="h-11 rounded-lg text-white px-6 font-bold text-sm transition shadow disabled:opacity-50 whitespace-nowrap"
                style={{backgroundColor:"#e85d04"}}>
                {loading ? "Aranıyor..." : "🔍 Ara"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* İÇERİK */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">

        {/* İSTATİSTİKLER */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Toplam Yorum", value: totalReviews, icon: "💬" },
            { label: "Değerlendirilen Ev", value: properties.length, icon: "🏘️" },
            { label: "Aktif İl", value: "81", icon: "📍" },
            { label: "Ücretsiz", value: "Her Zaman", icon: "✨" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white border shadow-sm p-4 text-center" style={{borderColor:"#fde8d8"}}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold" style={{color:"#c2440e"}}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* YORUMLAR VE PUANLAR */}
        <section className="grid gap-6 lg:grid-cols-2">

          <div id="yorumlar" className="rounded-2xl bg-white border shadow-sm p-6" style={{borderColor:"#fde8d8"}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">💬 Son Eklenen Yorumlar</h2>
                <p className="text-xs text-gray-400">Sayfa {page}/{totalPages} · {totalReviews} yorum</p>
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              {reviews.length === 0 && (
                <div className="rounded-xl p-6 text-center" style={{backgroundColor:"#fdf8f3"}}>
                  <p className="text-gray-400 text-sm">Bu arama için yorum bulunamadı.</p>
                </div>
              )}
              {reviews.map((review) => {
                const inner = (
                  <div className="rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md" style={{borderColor:"#fde8d8", backgroundColor:"#fffaf7"}}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{backgroundColor:"#e85d04"}}>
                          {review.yazar_adi?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{review.yazar_adi}</p>
                      </div>
                      <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{backgroundColor:"#e85d04"}}>
                        {review.ortalamaPuan.toFixed(1)} ★
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      📍 {review.properties
                        ? review.properties.adres + ", " + review.properties.mahalle + ", " + review.properties.ilce + " / " + review.properties.il
                        : "Adres bilgisi yok"}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{review.yorum_metni}</p>
                    <p className="mt-2 text-xs text-gray-300">{formatDate(review.tarih)}</p>
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
                    className="rounded-lg border px-4 py-2 text-sm font-medium transition" style={{borderColor:"#fde8d8", color:"#c2440e"}}>
                    ← Önceki
                  </button>
                )}
                {page < totalPages && (
                  <button onClick={() => setPage(page + 1)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium transition" style={{borderColor:"#fde8d8", color:"#c2440e"}}>
                    Sonraki →
                  </button>
                )}
              </nav>
            )}
          </div>

          <div id="puanlar" className="rounded-2xl bg-white border shadow-sm p-6" style={{borderColor:"#fde8d8"}}>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">🏆 Ortalama Puanlar</h2>
              <p className="text-xs text-gray-400">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</p>
            </div>
            <div className="space-y-3">
              {properties.length === 0 && (
                <div className="rounded-xl p-6 text-center" style={{backgroundColor:"#fdf8f3"}}>
                  <p className="text-gray-400 text-sm">Bu arama için puanlanmış ev bulunamadı.</p>
                </div>
              )}
              {properties.map((property) => (
                <Link key={property.id} href={"/ev/" + property.id}
                  className="flex items-center justify-between gap-4 rounded-xl border p-4 transition-all hover:shadow-md"
                  style={{borderColor:"#fde8d8", backgroundColor:"#fffaf7"}}>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{property.adres}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {property.mahalle}, {property.ilce} / {property.il}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{property.reviewCount} yorum</p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow" style={{backgroundColor:"#e85d04"}}>
                      <span className="text-white font-bold text-sm">{property.ortalamaPuan.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="text-center py-4 text-xs text-gray-300 border-t" style={{borderColor:"#fde8d8"}}>
          Kiracı Yorum © 2026 · Tüm yorumlar gerçek kiracılara aittir
        </footer>
      </div>
    </main>
  );
}