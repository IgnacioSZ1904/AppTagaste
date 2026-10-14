import { useHealth } from '@/api/health'

export function HomePage() {
  const { data, error, isPending } = useHealth()

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Bienvenido a AppTagaste</h1>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {isPending && <p className="text-slate-500">Comprobando la API…</p>}
        {data && (
          <p className="font-medium text-green-700">API: {data.status}</p>
        )}
        {error && (
          <p role="alert" className="font-medium text-red-700">
            API no disponible: {error.message}
          </p>
        )}
      </div>
    </section>
  )
}
