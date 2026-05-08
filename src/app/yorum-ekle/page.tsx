"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const KATEGORILER = [
  { key: "ev_durumu_puan", label: "Ev Genel Durumu" },
  { key: "isinma_puan", label: "Isınma Durumu" },
  { key: "tesisat_puan", label: "Tesisat Durumu" },
  { key: "rutubet_puan", label: "Rutubet Durumu" },
  { key: "ses_yalitimi_puan", label: "Ses Yalıtımı" },
  { key: "ev_sahibi_tutum_puan", label: "Ev Sahibi Tutumu" },
  { key: "deposito_puan", label: "Deposito İadesi" },
  { key: "kira_artis_puan", label: "Kira Artışına Yaklaşım" },
];

function YildizSecici({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          className={"text-2xl transition " + (star <= value ? "text-yellow-400" : "text-zinc-300") + " hover:text-yellow-400"}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function YorumEklePage() {
  const router = useRouter();
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
  const [apartmanNo, setApartmanNo] = useState("");
  const [daireNo, setDaireNo] = useState("");

  const [illerYuklendi, setIllerYuklendi] = useState(false);
  const [ilcelerYukleniyor, setIlcelerYukleniyor] = useState(false);
  const [mahallelerYukleniyor, setMahallelerYukleniyor] = useState(false);

  const [yazarAdi, setYazarAdi] = useState("");
  const [yorumMetni, setYorumMetni] = useState("");
  const [puanlar, setPuanlar] = useState({
    ev_durumu_puan: 0, isinma_puan: 0, tesisat_puan: 0,
    rutubet_puan: 0, ses_yalitimi_puan: 0,
    ev_sahibi_tutum_puan: 0, deposito_puan: 0, kira_artis_puan: 0,
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function illeriYukle() {
    if (illerYuklendi) return;
    try {
      const res = await fetch("/api/adres?tip=iller");
      const json = await res.json();
      setIller(json.data ?? json);
      setIllerYuklendi(true);
    } catch {
      setHata("İller yüklenemedi.");
    }
  }

  async function ilSecildi(id: number, adi: string) {
    setIlId(id); setIlAdi(adi);
    setIlceId(null); setIlceAdi("");
    setMahalleAdi(""); setSokakAdi("");
    setIlceler([]); setMahalleler([]);
    if (!id) return;
    setIlcelerYukleniyor(true);
    try {
      const res = await fetch("/api/adres?tip=ilceler&id=" + id);
      const json = await res.json();
      setIlceler(json.data?.towns ?? json.towns ?? []);
    } catch {
      setHata("İlçeler yüklenemedi.");
    } finally {
      setIlcelerYukleniyor(false);
    }
  }

  async function ilceSecildi(id: number, adi: string) {
    setIlceId(id); setIlceAdi(adi);
    setMahalleAdi(""); setSokakAdi("");
    setMahalleler([]);
    if (!id) return;
    setMahallelerYukleniyor(true);
    try {
      const res = await fetch("/api/adres?tip=mahalleler&id=" + id);
      const json = await res.json();
      setMahalleler(json.data?.districts ?? json.districts ?? []);
    } catch {
      setHata("Mahalleler yüklenemedi.");
    } finally {
      setMahallelerYukleniyor(false);
    }
  }

  async function formuGonder() {
    if (!ilAdi || !ilceAdi || !mahalleAdi) {
      setHata("Lütfen il, ilçe ve mahalle seçiniz.");
      return;
    }
    if (!yazarAdi.trim()) {
      setHata("Lütfen adınızı yazınız.");
      return;
    }
    const eksikPuan = KATEGORILER.find((k) => puanlar[k.key as keyof typeof puanlar] === 0);
    if (eksikPuan) {
      setHata("Lütfen \"" + eksikPuan.label + "\" için puan veriniz.");
      return;
    }
    if (!yorumMetni.trim()) {
      setHata("Lütfen bir yorum yazınız.");
      return;
    }

    setHata("");
    setYukleniyor(true);

    try {
      const adresParcalari = [];
      if (sokakAdi) adresParcalari.push(sokakAdi);
      if (apartmanNo) adresParcalari.push("No: " + apartmanNo);
      if (daireNo) adresParcalari.push("D: " + daireNo);
      const adres = adresParcalari.length > 0 ? adresParcalari.join(" ") : mahalleAdi + " Mah.";

      const { data: existingProps } = await supabase
        .from("properties").select("id")
        .eq("il", ilAdi).eq("ilce", ilceAdi).eq("mahalle", mahalleAdi).eq("adres", adres)
        .limit(1);

      let propertyId: number;
      if (existingProps && existingProps.length > 0) {
        propertyId = existingProps[0].id;
      } else {
        const { data: newProp, error: propError } = await supabase
          .from("properties").insert({ il: ilAdi, ilce: ilceAdi, mahalle: mahalleAdi, adres, sokak: sokakAdi, apartman_no: apartmanNo, daire_no: daireNo })
          .select("id").single();
        if (propError) throw propError;
        propertyId = newProp.id;
      }

      const { error: reviewError } = await supabase.from("reviews").insert({
        ev_id: propertyId,
        yazar_adi: yazarAdi.trim(),
        yorum_metni: yorumMetni.trim(),
        tarih: new Date().toISOString(),
        onaylandi: false,
        ...puanlar,
      });
      if (reviewError) throw reviewError;

      router.push("/ev/" + propertyId);
    } catch (err: any) {
      setHata("Bir hata oluştu: " + (err.message ?? "Bilinmeyen hata"));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#fdf8f3" }}>
      <nav style={{ backgroundColor: "#f97316" }} className="text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              🏠
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Kiracı Yorum</span>
              <p className="text-xs leading-none" style={{ color: "#ffd4b8" }}>
                Kiracıların sesi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition"
              style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "white" }}
            >
              ← Geri
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg px-4 py-2 text-sm font-bold transition shadow"
              style={{ backgroundColor: "white", color: "#c2440e" }}
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="rounded-2xl p-5 text-white shadow-sm" style={{ backgroundColor: "#e85d04" }}>
          <h1 className="text-2xl font-extrabold tracking-tight">Yorum Bırak</h1>
          <p className="mt-1 text-sm" style={{ color: "#ffe8d6" }}>
            Deneyimini paylaş, diğer kiracılara yol göster.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#fde8d8" }}>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">📍 Adres Bilgileri</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>İl *</label>
              <select value={ilId ?? ""} onFocus={illeriYukle} onClick={illeriYukle}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = iller.find((i: any) => i._id === id)?.city ?? "";
                  ilSecildi(id, adi);
                }}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#fde8d8" }}>
                <option value="">Seçiniz</option>
                {iller.map((i: any) => <option key={i._id} value={i._id}>{i.city}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>İlçe *</label>
              <select value={ilceId ?? ""} disabled={!ilId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = ilceler.find((i: any) => i._id === id)?.name ?? "";
                  ilceSecildi(id, adi);
                }}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 disabled:opacity-50"
                style={{ borderColor: "#fde8d8" }}>
                <option value="">{ilcelerYukleniyor ? "Yükleniyor..." : "Seçiniz"}</option>
                {ilceler.map((i: any) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>Mahalle *</label>
              <select value={mahalleAdi} disabled={!ilceId}
                onChange={(e) => setMahalleAdi(e.target.value)}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 disabled:opacity-50"
                style={{ borderColor: "#fde8d8" }}>
                <option value="">{mahallelerYukleniyor ? "Yükleniyor..." : "Seçiniz"}</option>
                {mahalleler.map((m: any) => <option key={m._id} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>Sokak / Cadde</label>
              <input placeholder="Örn: Atatürk Cad." value={sokakAdi} onChange={(e) => setSokakAdi(e.target.value)}
                className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#fde8d8" }} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>Apartman No</label>
              <input placeholder="Örn: 12" value={apartmanNo} onChange={(e) => setApartmanNo(e.target.value)}
                className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#fde8d8" }} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>Daire No</label>
              <input placeholder="Örn: 5" value={daireNo} onChange={(e) => setDaireNo(e.target.value)}
                className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#fde8d8" }} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">⭐ Puanlama</h2>
          <div className="space-y-3">
            {KATEGORILER.map((kat) => (
              <div key={kat.key} className="flex items-center justify-between">
                <span className="text-sm text-zinc-700">{kat.label}</span>
                <YildizSecici
                  value={puanlar[kat.key as keyof typeof puanlar]}
                  onChange={(v) => setPuanlar((prev) => ({ ...prev, [kat.key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">💬 Yorumunuz</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>İsim *</label>
              <input placeholder="Adınızı yazınız" value={yazarAdi} onChange={(e) => setYazarAdi(e.target.value)}
                className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#fde8d8" }} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "#c2440e" }}>Yorum *</label>
              <textarea placeholder="Ev hakkında deneyimlerinizi paylaşın..."
                value={yorumMetni} onChange={(e) => setYorumMetni(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "#fde8d8" }} />
            </div>
          </div>
        </div>

        {hata && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{hata}</p>
        )}

        <button
          onClick={formuGonder}
          disabled={yukleniyor}
          className="h-12 w-full rounded-xl font-bold text-white transition disabled:opacity-50"
          style={{ backgroundColor: "#e85d04" }}
        >
          {yukleniyor ? "Gönderiliyor..." : "Yorumu Gönder"}
        </button>
      </div>
      </section>
    </main>
  );
}
