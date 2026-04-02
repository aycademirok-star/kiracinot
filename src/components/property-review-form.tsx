"use client";

import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  type CategoryKey,
} from "@/lib/ratings";
import { StarPicker } from "@/components/star-rating";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const initialScores: Record<CategoryKey, number> = {
  ev_durumu_puan: 5,
  ev_sahibi_puan: 5,
  fiyat_puan: 5,
  konum_puan: 5,
  ses_yalitimi_puan: 5,
};

export function PropertyReviewForm({ propertyId }: { propertyId: number }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [yazarAdi, setYazarAdi] = useState("");
  const [scores, setScores] = useState(initialScores);
  const [yorumMetni, setYorumMetni] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!yazarAdi.trim()) {
      setSubmitError("Lütfen adınızı yazınız.");
      return;
    }
    if (!yorumMetni.trim() || yorumMetni.trim().length < 10) {
      setSubmitError("Yorum en az 10 karakter olmalıdır.");
      return;
    }

    setSubmitBusy(true);
    const { error } = await supabase.from("reviews").insert({
      ev_id: propertyId,
      yazar_adi: yazarAdi.trim(),
      ev_durumu_puan: scores.ev_durumu_puan,
      ev_sahibi_puan: scores.ev_sahibi_puan,
      fiyat_puan: scores.fiyat_puan,
      konum_puan: scores.konum_puan,
      ses_yalitimi_puan: scores.ses_yalitimi_puan,
      yorum_metni: yorumMetni.trim(),
    });

    setSubmitBusy(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setYazarAdi("");
    setYorumMetni("");
    setScores(initialScores);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Yorum ekle</h2>

      <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="yazar" className="text-sm font-medium text-zinc-700">
            Adınız *
          </label>
          <input
            id="yazar"
            value={yazarAdi}
            onChange={(e) => setYazarAdi(e.target.value)}
            required
            minLength={2}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="örn. Ayşe K."
          />
        </div>

        {CATEGORY_KEYS.map((key) => (
          <div key={key}>
            <p className="text-sm font-medium text-zinc-700">
              {CATEGORY_LABELS[key]}
            </p>
            <StarPicker
              value={scores[key]}
              onChange={(v) => setScores((s) => ({ ...s, [key]: v }))}
              name={CATEGORY_LABELS[key]}
            />
          </div>
        ))}

        <div>
          <label htmlFor="yorum" className="text-sm font-medium text-zinc-700">
            Yorum *
          </label>
          <textarea
            id="yorum"
            value={yorumMetni}
            onChange={(e) => setYorumMetni(e.target.value)}
            required
            minLength={10}
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Deneyiminizi yazın…"
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitBusy}
          className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {submitBusy ? "Gönderiliyor…" : "Yorumu gönder"}
        </button>
      </form>
    </div>
  );
}
