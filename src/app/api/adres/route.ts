const TURKIYE_API = "https://api.turkiyeapi.dev/v1";

const ILLER_CACHE: any[] = [];
const ILCELER_CACHE: Record<number, any[]> = {};
const MAHALLELER_CACHE: Record<number, any[]> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tip = searchParams.get("tip");
  const id = searchParams.get("id");

  try {
    if (tip === "iller") {
      if (ILLER_CACHE.length > 0) return Response.json(ILLER_CACHE);
      const res = await fetch(TURKIYE_API + "/provinces?fields=id,name&limit=100");
      const json = await res.json();
      const data = (json.data ?? []).map((p: any) => ({ _id: p.id, city: p.name }));
      ILLER_CACHE.push(...data);
      return Response.json(data);
    }

    if (tip === "ilceler" && id) {
      const ilId = Number(id);
      if (ILCELER_CACHE[ilId]) return Response.json({ towns: ILCELER_CACHE[ilId] });
      const res = await fetch(TURKIYE_API + "/districts?provinceId=" + ilId + "&fields=id,name&limit=200");
      const json = await res.json();
      const data = (json.data ?? []).map((d: any) => ({ _id: d.id, name: d.name }));
      ILCELER_CACHE[ilId] = data;
      return Response.json({ towns: data });
    }

    if (tip === "mahalleler" && id) {
      const ilceId = Number(id);
      if (MAHALLELER_CACHE[ilceId]) return Response.json({ districts: MAHALLELER_CACHE[ilceId] });
      const res = await fetch(TURKIYE_API + "/neighborhoods?districtId=" + ilceId + "&fields=id,name&limit=500");
      const json = await res.json();
      const data = (json.data ?? []).map((m: any) => ({ _id: m.id, name: m.name }));
      MAHALLELER_CACHE[ilceId] = data;
      return Response.json({ districts: data });
    }

    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "API hatası" }, { status: 500 });
  }
}