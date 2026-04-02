import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Ev bulunamadı</h1>
      <p className="mt-2 text-zinc-600">
        Bu adrese ait kayıt yok veya kaldırılmış olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Ana sayfaya dön
      </Link>
    </main>
  );
}
