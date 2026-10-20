import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

/** Se muestra si una pantalla falla al cargar o al pintarse, en lugar de la traza. */
export function ErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <section
      role="alert"
      className="mx-auto max-w-md space-y-4 px-4 py-12 text-center"
    >
      <h1 className="text-brand-700 text-2xl font-bold">
        {notFound ? 'Página no encontrada' : 'Algo ha fallado'}
      </h1>
      <p className="text-slate-600">
        {notFound
          ? 'La página que buscas no existe.'
          : 'No se ha podido mostrar esta pantalla. Prueba a recargar; si sigue pasando, avisa al administrador.'}
      </p>
      {!notFound && error instanceof Error && (
        <p className="text-sm text-slate-500">{error.message}</p>
      )}
      <div className="flex justify-center gap-2">
        {!notFound && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        )}
        <Link to="/" className="btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
