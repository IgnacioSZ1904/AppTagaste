import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-slate-600">La página que buscas no existe.</p>
      <Link to="/" className="text-indigo-700 underline">
        Volver al inicio
      </Link>
    </section>
  )
}
