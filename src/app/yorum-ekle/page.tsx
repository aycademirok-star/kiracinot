"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ILLER = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin",
  "Aydın","Balıkesir","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum",
  "Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Isparta","Mersin",
  "İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas",
  "Tekirdağ","Tokat","Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat","Zonguldak",
  "Aksaray","Bayburt","Karaman","Kırıkkale","Batman","Şırnak","Bartın","Ardahan",
  "Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce"
];

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
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition ${star <= value ? "text-yellow-400" : "text-zinc-300"} hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function YorumEklePage() {
  const router = useRouter();
  const supabase = createClient();

  const [il, setIl] = useState("");
  const [ilce, setIlce] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [sokak, setSokak] = useState("");
  const [apartmanNo, setApartmanNo] = useState("");
  const [ilceler, setIlceler] = useState<string[]>([]);
  const [mahalleler, setMahalleler] = useState<string[]>([]);
  const [sokaklar, setSokaklar] = useState<string[]>([]);

  const [yazarAdi, setYazarAdi] = useState("");
  const [yorumMetni, setYorumMetni] = useState("");
  const [puanlar, setPuanlar] = useState({
    ev_durumu_puan: 0,
    ev_sahibi_puan: 0,
    fiyat_puan: 0,
    konum_puan: 0,
    ses_yalitimi_puan: 0,
  });

  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function ilSecildi(yeniIl: string) {
    setIl(yeniIl);
    setIlce(""); setMahalle(""); setSokak("");
    if (!yeniIl) { setIlceler([]); return; }
    const { data } = await supabase.from("properties").select("ilce").eq("il", yeniIl);
    const unique = [...new Set((data ?? []).map((d: any) => d.ilce).filter(Boolean))].sort();
    setIlceler(unique);
  }

  async function ilceSecildi(yeniIlce: string) {
    setIlce(yeniIlce);
    setMahalle(""); setSokak("");
    if (!yeniIlce) { setMahalleler([]); return; }
    const { data } = await supabase.from("properties").select("mahalle").eq("il", il).eq("ilce", yeniIlce);
    const unique = [...new Set((data ?? []).map((d: any) => d.mahalle).filter(Boolean))].sort();
    setMahalleler(unique);
  }

  async function mahalleSecildi(yeniMahalle: string) {
    setMahalle(yeniMahalle);
    setSokak("");
    if (!yeniMahalle) { setSokaklar([]); return; }
    const { data } = await supabase.from("properties").select("adres").eq("il", il).eq("ilce", ilce).eq("mahalle", yeniMahalle);
    const unique = [...new Set((data ?? []).map((d: any) => d.adres).filter(Boolean))].sort();
    setSokaklar(unique);
  }

  async function formuGonder() {
    // Adres kontrolü
    if (!il || !ilce || !mahalle) {
      setHata("Lütfen en az il, ilçe ve mahalle seçiniz.");
      return;
    }
    // Puan kontrolü
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
      // Adresi oluştur
      const adres = [sokak, apartmanNo].filter(Boolean).join(" No: ") || `${mahalle} Mah.`;

      // Önce property var mı kontrol et
      let { data: existingProps } = await supabase
        .from("properties")
        .select("id")
        .eq("il", il)
        .eq("ilce", ilce)
        .eq("mahalle", mahalle)
        .eq("adres", adres)
        .limit(1);

      let propertyId: number;

      if (existingProps && existingProps.length > 0) {
        propertyId = existingProps[0].id;
      } else {
        // Yeni property ekle
        const { data: newProp, error: propError } = await supabase
          .from("properties")
          .insert({ il, ilce, mahalle, adres })
          .select("id")
          .single();

        if (propError) throw propError;
        propertyId = newProp.id;
      }

      // Yorumu ekle
      const { error: reviewError } = await supabase.from("reviews").insert({
        ev_id: propertyId,
        yazar_adi: yazarAdi.trim() || "Anonim",
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

        {/* ADRES */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">📍 Adres Bilgileri</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-zinc-600">İl *</label>
              <select value={il} onChange={(e) => ilSecildi(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2">
                <option value="">Seçiniz</option>
                {ILLER.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">İlçe *</label>
              <select value={ilce} onChange={(e) => ilceSecildi(e.target.value)} disabled={!il}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
                <option value="">Seçiniz</option>
                {ilceler.map((i) => <option key={i} value={i}>{i}</option>)}
                {il && ilceler.length === 0 && <option value={`${il} Merkez`}>{il} Merkez</option>}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">Mahalle *</label>
              <select value={mahalle} onChange={(e) => mahalleSecildi(e.target.value)} disabled={!ilce}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2 disabled:opacity-50">
                <option value="">Seçiniz</option>
                {mahalleler.map((i) => <option key={i} value={i}>{i}</option>)}
                {ilce && mahalleler.length === 0 && (
                  <option value="Yeni Mahalle">Mahalle adını yazarak ekle</option>
                )}
              </select>
              {ilce && mahalleler.length === 0 && (
                <input
                  placeholder="Mahalle adını yazın"
                  value={mahalle}
                  onChange={(e) => setMahalle(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">Sokak</label>
              {sokaklar.length > 0 ? (
                <select value={sokak} onChange={(e) => setSokak(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none ring-blue-600 focus:ring-2">
                  <option value="">Seçiniz</option>
                  {sokaklar.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              ) : (
                <input placeholder="Sokak adı" value={sokak} onChange={(e) => setSokak(e.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2" />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-600">Apartman No</label>
              <input placeholder="Örn: 12" value={apartmanNo} onChange={(e) => setApartmanNo(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2" />
            </div>
          </div>
        </div>

        {/* PUANLAMA */}
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

        {/* YORUM */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">💬 Yorumunuz</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-zinc-600">İsim (opsiyonel)</label>
              <input placeholder="Anonim olarak bırakmak için boş bırakın"
                value={yazarAdi} onChange={(e) => setYazarAdi(e.target.value)}
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

        {/* HATA */}
        {hata && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{hata}</p>
        )}

        {/* GÖNDER */}
        <button onClick={formuGonder} disabled={yukleniyor}
          className="w-full h-12 rounded-xl bg-zinc-900 font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
          {yukleniyor ? "Gönderiliyor..." : "Yorumu Gönder"}
        </button>
      </div>
    </main>
  );
}
