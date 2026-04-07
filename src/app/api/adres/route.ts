import { createClient } from "@supabase/supabase-js";

const TURKIYE_API = "https://api.turkiyeapi.dev/v1";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tip = searchParams.get("tip");
  const id = searchParams.get("id");
  const yukle = searchParams.get("yukle");

  try {
    // Veri yükleme modu
    if (yukle === "iller") {
      const res = await fetch(TURKIYE_API + "/provinces?fields=id,name&limit=100");
      const json = await res.json();
      const data = (json.data ?? []).map((p: any) => ({ id: p.id, name: p.name }));
      await supabase.from("iller").upsert(data);
      return Response.json({ mesaj: data.length + " il yuklendi" });
    }

    if (yukle === "ilceler") {
      let offset = 0;
      let toplam = 0;
      while (true) {
        const res = await fetch(TURKIYE_API + "/districts?fields=id,name,provinceId&limit=100&offset=" + offset);
        const json = await res.json();
        const data = (json.data ?? []).map((d: any) => ({ id: d.id, il_id: d.provinceId, name: d.name }));
        if (data.length === 0) break;
        await supabase.from("ilceler").upsert(data);
        toplam += data.length;
        offset += 100;
        if (data.length < 100) break;
      }
      return Response.json({ mesaj: toplam + " ilce yuklendi" });
    }

    if (yukle === "mahalleler" && id) {
      const ilceId = Number(id);
      let offset = 0;
      let toplam = 0;
      while (true) {
        const res = await fetch(TURKIYE_API + "/neighborhoods?districtId=" + ilceId + "&fields=id,name&limit=500&offset=" + offset);
        const json = await res.json();
        const data = (json.data ?? []).map((m: any) => ({ id: m.id, ilce_id: ilceId, name: m.name }));
        if (data.length === 0) break;
        await supabase.from("mahalleler").upsert(data);
        toplam += data.length;
        offset += 500;
        if (data.length < 500) break;
      }
      return Response.json({ mesaj: toplam + " mahalle yuklendi, ilce: " + ilceId });
    }

    // Normal okuma modu
    if (tip === "iller") {
      const { data } = await supabase.from("iller").select("id, name").order("name");
      return Response.json((data ?? []).map((p: any) => ({ _id: p.id, city: p.name })));
    }

    if (tip === "ilceler" && id) {
      const { data } = await supabase.from("ilceler").select("id, name").eq("il_id", Number(id)).order("name");
      return Response.json({ towns: (data ?? []).map((d: any) => ({ _id: d.id, name: d.name })) });
    }

    if (tip === "mahalleler" && id) {
      const { data } = await supabase.from("mahalleler").select("id, name").eq("ilce_id", Number(id)).order("name");
      if (!data || data.length === 0) {
        // Supabase'de yoksa API'den çek ve kaydet
        const res = await fetch(TURKIYE_API + "/neighborhoods?districtId=" + id + "&fields=id,name&limit=500");
        const json = await res.json();
        const mahalleler = (json.data ?? []).map((m: any) => ({ id: m.id, ilce_id: Number(id), name: m.name }));
        if (mahalleler.length > 0) await supabase.from("mahalleler").upsert(mahalleler);
        return Response.json({ districts: mahalleler.map((m: any) => ({ _id: m.id, name: m.name })) });
      }
      return Response.json({ districts: (data ?? []).map((d: any) => ({ _id: d.id, name: d.name })) });
    }

    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Hata" }, { status: 500 });
  }
}