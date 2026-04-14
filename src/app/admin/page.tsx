"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [sifre, setSifre] = useState("");
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [hata, setHata] = useState("");
  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [duzenlenenId, setDuzenlenenId] = useState<number | null>(null);
  const [duzenlenenMetin, setDuzenlenenMetin] = useState("");

  const supabase = createClient();

  async function girisYap() {
    const res = await fetch("/api/admin-giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sifre }),
    });
    const json = await res.json();
    if (json.basarili) {
      setGirisYapildi(true);
      setHata("");
      yorumlariGetir();
    } else {
      setHata("Şifre yanlış!");
    }
  }

  async function yorumlariGetir() {
    setYukleniyor(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, yazar_adi, yorum_metni, tarih, onaylandi, properties:ev_id(adres, il, ilce, mahalle)")
      .order("tarih", { ascending: false });
    setYorumlar((data ?? []).map((r: any) => ({
      ...r,
      properties: Array.isArray(r.properties) ? r.properties[0] : r.properties,
    })));
    setYukleniyor(false);
  }

  async function yorumuOnayla(id: number, metin: string) {
    await supabase.from("reviews").update({ onaylandi: true, yorum_metni: metin }).eq("id", id);
    setMesaj("Yorum onaylandı!");
    setDuzenlenenId(null);
    setTimeout(() => setMesaj(""), 2000);
    yorumlariGetir();
  }

  async function yorumuReddet(id: number) {
    await supabase.from("reviews").delete().eq("id", id);
    setMesaj("Yorum silindi!");
    setTimeout(() => setMesaj(""), 2000);
    yorumlariGetir();
  }

  function duzenlemeyiBaslat(id: number, metin: string) {
    setDuzenlenenId(id);
    setDuzenlenenMetin(metin);
  }

  if (!girisYapildi) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Girişi</h1>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && girisYap()}
              className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none ring-blue-600 focus:ring-2"
              placeholder="Şifrenizi girin"
            />
          </div>
          {hata && <p className="text-sm text-red-600">{hata}</p>}
          <button onClick={girisYap}
            className="w-full h-11 rounded-xl bg-zinc-900 font-medium text-white hover:bg-zinc-700">
            Giriş Yap
          </button>
        </div>
      </main>
    );
  }

  const bekleyenYorumlar = yorumlar.filter((y) => !y.onaylandi);
  const onaylananYorumlar = yorumlar.filter((y) => y.onaylandi);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Paneli</h1>
        <div className="flex items-center gap-4">
          {mesaj && <span className="text-sm text-green-600 font-medium">{mesaj}</span>}
          <span className="text-sm text-zinc-500">{bekleyenYorumlar.length} bekleyen yorum</span>
        </div>
      </div>

      {yukleniyor && <p className="text-zinc-500">Yükleniyor...</p>}

      {/* Bekleyen Yorumlar */}
      {bekleyenYorumlar.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">
            ⏳ Onay Bekleyen Yorumlar ({bekleyenYorumlar.length})
          </h2>
          <div className="space-y-4">
            {bekleyenYorumlar.map((yorum) => (
              <div key={yorum.id} className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900">{yorum.yazar_adi}</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      {yorum.properties
                        ? yorum.properties.adres + ", " + yorum.properties.mahalle + ", " + yorum.properties.ilce + " / " + yorum.properties.il
                        : "Adres bilgisi yok"}
                    </p>

                    {duzenlenenId === yorum.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={duzenlenenMetin}
                          onChange={(e) => setDuzenlenenMetin(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-blue-600 focus:ring-2 resize-none bg-white"
                        />
                        <p className="text-xs text-zinc-500">Küfür veya uygunsuz kelimeleri düzenleyip onaylayabilirsiniz.</p>
                      </div>
                    ) : (
                      <p className="mt-3 text-zinc-700">{yorum.yorum_metni}</p>
                    )}

                    <p className="mt-2 text-xs text-zinc-500">
                      {new Date(yorum.tarih).toLocaleDateString("tr-TR")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {duzenlenenId === yorum.id ? (
                      <>
                        <button onClick={() => yorumuOnayla(yorum.id, duzenlenenMetin)}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                          ✓ Onayla
                        </button>
                        <button onClick={() => setDuzenlenenId(null)}
                          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
                          İptal
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => yorumuOnayla(yorum.id, yorum.yorum_metni)}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                          ✓ Onayla
                        </button>
                        <button onClick={() => duzenlemeyiBaslat(yorum.id, yorum.yorum_metni)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                          ✎ Düzenle
                        </button>
                        <button onClick={() => yorumuReddet(yorum.id)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                          ✗ Sil
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bekleyenYorumlar.length === 0 && !yukleniyor && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-500">
          Bekleyen yorum yok 🎉
        </div>
      )}

      {/* Onaylanan Yorumlar */}
      {onaylananYorumlar.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">
            ✅ Onaylanan Yorumlar ({onaylananYorumlar.length})
          </h2>
          <div className="space-y-3">
            {onaylananYorumlar.map((yorum) => (
              <div key={yorum.id} className="rounded-2xl border border-zinc-200 bg-white p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900">{yorum.yazar_adi}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {yorum.properties
                      ? yorum.properties.mahalle + ", " + yorum.properties.ilce + " / " + yorum.properties.il
                      : "Adres bilgisi yok"}
                  </p>
                  <p className="mt-2 text-sm text-zinc-700">{yorum.yorum_metni}</p>
                </div>
                <button onClick={() => yorumuReddet(yorum.id)}
                  className="rounded-xl border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 shrink-0">
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
