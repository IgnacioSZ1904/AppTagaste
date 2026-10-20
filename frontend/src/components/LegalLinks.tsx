import { Link } from 'react-router'

/** "Privacidad · Condiciones", en el login, la app y las propias páginas legales. */
export function LegalLinks({ className = '' }: { className?: string }) {
  return (
    <nav
      aria-label="Información legal"
      className={`text-xs text-slate-500 ${className}`}
    >
      <Link to="/privacidad" className="hover:text-brand-700 hover:underline">
        Privacidad
      </Link>
      {' · '}
      <Link to="/condiciones" className="hover:text-brand-700 hover:underline">
        Condiciones
      </Link>
    </nav>
  )
}
