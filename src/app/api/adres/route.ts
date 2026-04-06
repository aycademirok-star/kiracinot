const API = "https://turkey-geolocation-rest-api.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tip = searchParams.get("tip");
  const id = searchParams.get("id");

  let url = "";
  if (tip === "iller") {
    url = `${API}/cities`;
  } else if (tip === "ilceler" && id) {
    url = `${API}/cities/${id}?fields=city,towns`;
  } else if (tip === "mahalleler" && id) {
    url = `${API}/towns/${id}?fields=name,districts`;
  } else {
    return Response.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return Response.json(data, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return Response.json({ error: "API hatası" }, { status: 500 });
  }
}