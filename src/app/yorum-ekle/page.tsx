"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const KATEGORILER = [
  { key: "ev_durumu_puan", label: "Ev Genel Durumu" },
  { key: "ev_sahibi_puan", label: "Ev Sahibi" },
  { key: "fiyat_puan", label: "Fiyat / Değer Oranı" },
  { key: "konum_puan", label: "Konum / Ulaşım" },
  { key: "ses_yalitimi_puan", label: "Ses Yalıtımı" },
];

function YildizSecici({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          className={`text-2xl transition ${star <= value ? "text-yellow-400" : "text-zinc-300"} hover:text-yellow-400`}>
          ★
        </button>
      ))}
    </div>
  );
}

type IlItem = { id: number; il_adi: string };
type IlceItem = { id: number; ilce_adi: string };
type MahalleItem = { id: number; mahalle_adi: string };
type SokakItem = { id: number; sokak_adi: string };

export default function YorumEklePage() {
  const router = useRouter();
  const supabase = createClient();

  const [iller, setIller] = useState<IlItem[]>([]);
  const [ilceler, setIlceler] = useState<IlceItem[]>([]);
  const [mahalleler, setMahalleler] = useState<MahalleItem[]>([]);
  const [sokaklar, setSokaklar] = useState<SokakItem[]>([]);

  const [ilId, setIlId] = useState<number | null>(null);
  const [ilAdi, setIlAdi] = useState("");
  const [ilceId, setIlceId] = useState<number | null>(null);
  const [ilceAdi, setIlceAdi] = useState("");
  const [mahalleId, setMahalleId] = useState<number | null>(null);
  const [mahalleAdi, setMahalleAdi] = useState("");
  const [sokakAdi, setSokakAdi] = useState("");
  const [apartmanNo, setApartmanNo] = useState("");

  const [illerYuklendi, setIllerYuklendi] = useState(false);
  const [ilcelerYukleniyor, setIlcelerYukleniyor] = useState(false);
  const [mahallelerYukleniyor, setMahallelerYukleniyor] = useState(false);
  const [sokaklarYukleniyor, setSokaklarYukleniyor] = useState(false);

  const [yazarAdi, setYazarAdi] = useState("");
  const [yorumMetni, setYorumMetni] = useState("");
  const [puanlar, setPuanlar] = useState({
    ev_durumu_puan: 0, ev_sahibi_puan: 0, fiyat_puan: 0,
    konum_puan: 0, ses_yalitimi_puan: 0,
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function illeriYukle() {
    if (illerYuklendi) return;
    try {
      const res = await fetch("https://tradres.com.tr/api/iller");
      const data = await res.json();
      setIller(data);
      setIllerYuklendi(true);
    } catch {
      setHata("İller yüklenemedi. Lütfen sayfayı yenileyin.");
    }
  }

  async function ilSecildi(id: number, adi: string) {
    setIlId(id); setIlAdi(adi);
    setIlceId(null); setIlceAdi("");
    setMahalleId(null); setMahalleAdi("");
    setSokakAdi("");
    setIlceler([]); setMahalleler([]); setSokaklar([]);
    if (!id) return;
    setIlcelerYukleniyor(true);
    try {
      const res = await fetch(`https://tradres.com.tr/api/ilceler?il_id=${id}`);
      const data = await res.json();
      setIlceler(data);
    } catch {
      setHata("İlçeler yüklenemedi.");
    } finally {
      setIlcelerYukleniyor(false);
    }
  }

  async function ilceSecildi(id: number, adi: string) {
    setIlceId(id); setIlceAdi(adi);
    setMahalleId(null); setMahalleAdi("");
    setSokakAdi("");
    setMahalleler([]); setSokaklar([]);
    if (!id) return;
    setMahallelerYukleniyor(true);
    try {
      const res = await fetch(`https://tradres.com.tr/api/mahalleler?ilce_id=${id}`);
      const data = await res.json();
      setMahalleler(data);
    } catch {
      setHata("Mahalleler yüklenemedi.");
    } finally {
      setMahallelerYukleniyor(false);
    }
  }

  async function mahalleSecildi(id: number, adi: string) {
    setMahalleId(id); setMahalleAdi(adi);
    setSokakAdi("");
    setSokaklar([]);
    if (!id) return;
    setSokaklarYukleniyor(true);
    try {
      const res = await fetch(`https://tradres.com.tr/api/sokaklar?mahalle_id=${id}`);
      const data = await res.json();
      setSokaklar(Array.isArray(data) ? data : []);
    } catch {
      setSokaklar([]);
    } finally {
      setSokaklarYukleniyor(false);
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
      setHata(`Lütfen "${eksikPuan.label}" için puan veriniz.`);
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
      if (apartmanNo) adresParcalari.push(`No: ${apartmanNo}`);
      const adres = adresParcalari.length > 0 ? adresParcalari.join(" ") : `${mahalleAdi} Mah.`;

      const { data: existingProps } = await supabase
        .from("properties").select("id")
        .eq("il", ilAdi).eq("ilce", ilceAdi).eq("mahalle", mahalleAdi).eq("adres", adres)
        .limit(1);

      let propertyId: number;
      if (existingProps && existingProps.length > 0) {
        propertyId = existingProps[0].id;
      } else {
        const { data: newProp, error: propError } = await supabase
          .from("properties").insert({ il: ilAdi, ilce: ilceAdi, mahalle: mahalleAdi, adres })
          .select("id").single();
        if (propError) throw propError;
        propertyId = newProp.id;
      }

      const { error: reviewError } = await supabase.from("reviews").insert({
        ev_id: propertyId,
        yazar_adi: yazarAdi.trim(),
        yorum_metni: yorumMetni.trim(),
        tarih: new Date().toISOString(),
        ...puanlar,
      });
      if (reviewError) throw reviewError;

      router.push(`/ev/${propertyId}`);
    } catch (err: any) {
      setHata("Bir hata oluştu: " + (err.message ?? "Bilinmeyen hata"));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900">← Geri</button>
        <h1 className="text-2xl font-bold text-zinc-900">Yorum Bırak</h1>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">

        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">📍 Adres Bilgileri</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm text-zinc-600">İl *</label>
              <select value={ilId ?? ""} onFocus={illeriYukle}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = iller.find(i => i.id === id)?.il_adi ?? "";
                  ilSecildi(id, adi);
                }}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2">
                <option value="">Seçiniz</option>
                {iller.map((i) => <option key={i.id} value={i.id}>{i.il_adi}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-600">İlçe *</label>
              <select value={ilceId ?? ""} disabled={!ilId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = ilceler.find(i => i.id === id)?.ilce_adi ?? "";
                  ilceSecildi(id, adi);
                }}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
                <option value="">{ilcelerYukleniyor ? "Yükleniyor..." : "Seçiniz"}</option>
                {ilceler.map((i) => <option key={i.id} value={i.id}>{i.ilce_adi}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-600">Mahalle *</label>
              <select value={mahalleId ?? ""} disabled={!ilceId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const adi = mahalleler.find(m => m.id === id)?.mahalle_adi ?? "";
                  mahalleSecildi(id, adi);
                }}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
                <option value="">{mahallelerYukleniyor ? "Yükleniyor..." : "Seçiniz"}</option>
                {mahalleler.map((m) => <option key={m.id} value={m.id}>{m.mahalle_adi}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-600">Sokak / Cadde</label>
              {sokaklar.length > 0 ? (
                <select value={sokakAdi} disabled={!mahalleId}
                  onChange={(e) => setSokakAdi(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
                  <option value="">{sokaklarYukleniyor ? "Yükleniyor..." : "Seçiniz"}</option>
                  {sokaklar.map((s) => <option key={s.id} value={s.sokak_adi}>{s.sokak_adi}</option>)}
                </select>
              ) : (
                <input placeholder={sokaklarYukleniyor ? "Yükleniyor..." : "Örn: Atatürk Cad."}
                  value={sokakAdi} onChange={(e) => setSokakAdi(e.target.value)}
                  disabled={sokaklarYukleniyor}
                  className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50" />
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-600">Apartman No</label>
              <input placeholder="Örn: 12" value={apartmanNo} onChange={(e) => setApartmanNo(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2" />
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
              <label className="mb-1 block text-sm text-zinc-600">İsim *</label>
              <input placeholder="Adınızı yazınız" value={yazarAdi} onChange={(e) => setYazarAdi(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">Yorum *</label>
              <textarea placeholder="Ev hakkında deneyimlerinizi paylaşın..."
                value={yorumMetni} onChange={(e) => setYorumMetni(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2 resize-none" />
            </div>
          </div>
        </div>

        {hata && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{hata}</p>
        )}

        <button onClick={formuGonder} disabled={yukleniyor}
          className="w-full h-12 rounded-xl bg-zinc-900 font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
          {yukleniyor ? "Gönderiliyor..." : "Yorumu Gönder"}
        </button>
      </div>
    </main>
  );
}
