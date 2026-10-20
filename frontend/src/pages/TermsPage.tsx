import { Link } from 'react-router'

import { LegalLayout } from '@/components/LegalLayout'

const CONTACT = 'segovia.ignacio1904@gmail.com'

export function TermsPage() {
  return (
    <LegalLayout
      title="Condiciones del Servicio"
      updated="20 de octubre de 2026"
    >
      <p>
        Al usar AppTagaste aceptas estas condiciones. Si no estás de acuerdo, no
        la uses.
      </p>

      <h2>1. Qué es</h2>
      <p>
        Una aplicación gratuita para organizar la catequesis de un colegio:
        calendario, grupos, pase de lista y biblioteca de recursos. La ofrece
        Ignacio Segovia Zurita.
      </p>

      <h2>2. Quién puede usarla</h2>
      <p>
        Cualquier persona con una cuenta de Google puede entrar y ver el
        calendario. El administrador asigna los roles de coordinador y monitor,
        que dan acceso a los grupos, al pase de lista y a la biblioteca. Los
        niños no tienen cuenta.
      </p>

      <h2>3. Uso correcto</h2>
      <ul>
        <li>Usa la app solo para la actividad de catequesis.</li>
        <li>
          No compartas datos de los niños fuera de la app ni añadas datos que no
          sean necesarios.
        </li>
        <li>No intentes acceder a lo que tu rol no permite.</li>
      </ul>

      <h2>4. Documentos que subes</h2>
      <p>
        Al subir un documento confirmas que tienes derecho a compartirlo con los
        catequistas. Se guarda una copia que solo ven el administrador, los
        coordinadores y los monitores, y no se usa para nada fuera de la app.
        Para pedir que se retire un documento, escribe al contacto.
      </p>

      <h2>5. Cuentas</h2>
      <p>
        El administrador puede cambiar tu rol o desactivar tu cuenta, por
        ejemplo al terminar el curso o por un mal uso.
      </p>

      <h2>6. Disponibilidad y garantías</h2>
      <p>
        La app se ofrece tal cual, sin garantía de que esté siempre disponible o
        libre de errores. Usa servicios gratuitos: la primera visita tras un
        rato sin uso puede tardar alrededor de un minuto en cargar.
      </p>

      <h2>7. Privacidad</h2>
      <p>
        Cómo tratamos los datos está en la{' '}
        <Link to="/privacidad">Política de Privacidad</Link>.
      </p>

      <h2>8. Cambios y contacto</h2>
      <p>
        Estas condiciones pueden cambiar; la fecha de arriba indica la última
        versión. Para cualquier duda:{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </LegalLayout>
  )
}
