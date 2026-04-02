"use client";

import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  type CategoryKey,
} from "@/lib/ratings";
import { StarPicker } from "@/components/star-rating";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Session } from "@supabase/supabase-js";

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

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [yazarAdi, setYazarAdi] = useState("");
  const [scores, setScores] = useState(initialScores);
  const [yorumMetni, setYorumMetni] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    setLoading(false);
  }, [supabase.auth]);

  useEffect(() => {
    void refreshSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth, refreshSession]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setAuthBusy(false);
    if (error) setAuthError(error.message);
  }

  async function handleSignUp() {
    setAuthError(null);
    setAuthBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setAuthBusy(false);
    if (error) setAuthError(error.message);
    else
      setAuthError(
        "Kayıt e-postası gönderildiyse gelen kutunuzu kontrol edin; aksi halde giriş yapmayı deneyin.",
      );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!session?.user) {
      setSubmitError("Yorum eklemek için giriş yapın.");
      return;
    }

    setSubmitBusy(true);
    const { error } = await supabase.from("reviews").insert({
      ev_id: propertyId,
      user_id: session.user.id,
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
      if (error.code === "23505") {
        setSubmitError("Bu ev için zaten yorum yapmışsınız.");
      } else {
        setSubmitError(error.message);
      }
      return;
    }

    setYazarAdi("");
    setYorumMetni("");
    setScores(initialScores);
    router.refresh();
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">Yükleniyor…</p>
    );
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Yorum ekle</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Yorum göndermek için e-posta ve şifre ile giriş yapın veya kayıt olun.
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="auth-email" className="text-sm font-medium text-zinc-700">
              E-posta
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-sm font-medium text-zinc-700">
              Şifre
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          {authError && (
            <p className="text-sm text-red-600">{authError}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={authBusy}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
            >
              Giriş yap
            </button>
            <button
              type="button"
              disabled={authBusy}
              onClick={() => void handleSignUp()}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              Kayıt ol
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Yorum ekle</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="max-w-[220px] truncate text-xs text-zinc-500">
            {session.user.email}
          </span>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm text-blue-700 hover:underline"
          >
            Çıkış
          </button>
        </div>
      </div>

      <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="yazar" className="text-sm font-medium text-zinc-700">
            Görünen ad
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
            Yorum
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
