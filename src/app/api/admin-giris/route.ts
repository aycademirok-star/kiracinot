export async function POST(request: Request) {
  const { sifre } = await request.json();
  const dogruSifre = process.env.ADMIN_PASSWORD;
  if (sifre === dogruSifre) {
    return Response.json({ basarili: true });
  }
  return Response.json({ basarili: false }, { status: 401 });
}