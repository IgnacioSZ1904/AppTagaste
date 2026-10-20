import { LegalLayout } from '@/components/LegalLayout'

const CONTACT = 'segovia.ignacio1904@gmail.com'

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="20 de octubre de 2026">
      <p>
        AppTagaste es una aplicación para organizar la catequesis de un colegio:
        calendario de reuniones y convivencias, grupos con sus responsables,
        pase de lista y una biblioteca de recursos. Esta política explica qué
        datos trata, para qué y cuáles son tus derechos, conforme al Reglamento
        General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018
        (LOPDGDD).
      </p>

      <h2>1. Responsable</h2>
      <p>
        Ignacio Segovia Zurita. Contacto:{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Usuarios:</strong> nombre, email e identificador de tu cuenta
          de Google y el rol que te asigna el administrador. No guardamos tu
          contraseña ni tu foto.
        </li>
        <li>
          <strong>Actividad:</strong> eventos del calendario y grupos con sus
          responsables.
        </li>
        <li>
          <strong>Niños de los grupos:</strong> solo su nombre y su asistencia a
          los eventos. Los niños no tienen cuenta.
        </li>
        <li>
          <strong>Biblioteca:</strong> los documentos que subes (una copia del
          fichero, su texto para el buscador, el curso, el grupo, las etiquetas
          y quién lo añadió).
        </li>
      </ul>

      <h2>3. Para qué</h2>
      <p>
        Solo para organizar la catequesis: que cada persona vea el calendario de
        su grupo, que los responsables pasen lista y que los catequistas
        compartan recursos. No hay publicidad, no se venden ni se ceden datos a
        terceros y no se toman decisiones automatizadas sobre nadie.
      </p>

      <h2>4. Base legal</h2>
      <ul>
        <li>
          Tu consentimiento al entrar con tu cuenta de Google, y el interés
          legítimo en organizar la actividad de catequesis.
        </li>
        <li>
          Los nombres de los niños se incluyen con el consentimiento de las
          familias recogido por el colegio.
        </li>
      </ul>

      <h2>5. Datos de menores</h2>
      <p>
        De los niños solo se guarda el nombre y la asistencia. No son públicos:
        solo los ven los responsables de su grupo y el administrador. Se borran
        al terminar el curso, al eliminar el grupo.
      </p>

      <h2>6. Datos de tu cuenta de Google</h2>
      <ul>
        <li>
          <strong>Inicio de sesión:</strong> Google nos facilita tu nombre,
          email e identificador para saber quién eres.
        </li>
        <li>
          <strong>
            Google Drive (permiso <code>drive.file</code>):
          </strong>{' '}
          solo cuando añades documentos a la biblioteca. La app únicamente
          accede a los ficheros que eliges en el selector de Google; no ve el
          resto de tu Drive. El permiso se usa en tu navegador para descargar el
          fichero elegido y subir una copia a la biblioteca; no se guarda en
          nuestros servidores.
        </li>
      </ul>
      <p>
        El uso que hace AppTagaste de la información recibida de las API de
        Google cumple la{' '}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noreferrer"
        >
          Política de datos de usuario de los servicios de API de Google
        </a>
        , incluidos los requisitos de Uso limitado. Esos datos no se usan para
        publicidad, no se ceden a terceros y no se usan para entrenar modelos de
        inteligencia artificial.
      </p>

      <h2>7. Dónde se guardan</h2>
      <p>Usamos estos proveedores, que tratan los datos por encargo nuestro:</p>
      <ul>
        <li>Vercel: aloja la web.</li>
        <li>Render: servidor de la aplicación (Fráncfort, Unión Europea).</li>
        <li>Neon: base de datos.</li>
        <li>Google: inicio de sesión y selector de Drive.</li>
      </ul>
      <p>
        Algunos pueden tratar datos fuera del Espacio Económico Europeo con las
        garantías que exige el RGPD (cláusulas contractuales tipo o Marco de
        Privacidad de Datos UE-EE. UU.).
      </p>

      <h2>8. Cuánto tiempo</h2>
      <ul>
        <li>Usuarios: mientras tengan cuenta en la app.</li>
        <li>Nombres de los niños y asistencia: hasta el final del curso.</li>
        <li>
          Documentos de la biblioteca: mientras sean útiles como recurso de
          catequesis.
        </li>
      </ul>

      <h2>9. Tus derechos</h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición, limitación y
        portabilidad de tus datos (o los de tu hijo o hija) escribiendo a{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Si no te atendemos
        correctamente, puedes reclamar ante la{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          Agencia Española de Protección de Datos
        </a>
        . Puedes retirar el acceso de la app a tu cuenta de Google en{' '}
        <a
          href="https://myaccount.google.com/connections"
          target="_blank"
          rel="noreferrer"
        >
          tu cuenta de Google
        </a>
        .
      </p>

      <h2>10. Cookies y almacenamiento</h2>
      <p>
        No usamos cookies de publicidad ni de analítica. El navegador guarda
        solo tu sesión y el grupo que eliges en el calendario (almacenamiento
        local), y Google usa sus propias cookies durante el inicio de sesión.
      </p>

      <h2>11. Cambios</h2>
      <p>
        Si cambia esta política, actualizaremos la fecha de arriba y, si el
        cambio es importante, lo avisaremos en la app.
      </p>
    </LegalLayout>
  )
}
