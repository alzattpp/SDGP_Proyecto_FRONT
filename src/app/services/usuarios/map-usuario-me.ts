/** Normaliza la respuesta de GET /me (o objeto usuario anidado) para las vistas de perfil. */
export interface UsuarioMeVista {
  nombre: string;
  documento: string;
  tipo: string;
  telefono: string;
  correo: string;
  parqueaderoNombre?: string;
  parqueaderoDesde?: string;
}

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

export function mapUsuarioMe(raw: unknown): UsuarioMeVista {
  const r = rec(raw) ?? {};
  const u = rec(r['usuario'] ?? r['user']) ?? r;

  const nombrePartes = [u['nombre'], u['apellido']].filter(
    (x) => x != null && String(x).trim() !== '',
  );
  const nombre =
    (nombrePartes.length ? nombrePartes.map(String).join(' ') : '') ||
    String(u['nombreCompleto'] ?? u['name'] ?? r['nombre'] ?? '') ||
    'Usuario';

  const documento = String(
    u['documento'] ??
      u['cedula'] ??
      u['numeroDocumento'] ??
      u['dni'] ??
      r['documento'] ??
      '—',
  );

  const rolRaw = String(
    u['rol'] ?? r['rol'] ?? u['tipoUsuario'] ?? u['tipo'] ?? r['tipo'] ?? 'usuario',
  );
  const tipo = rolRaw
    ? rolRaw.charAt(0).toUpperCase() + rolRaw.slice(1).toLowerCase()
    : 'Usuario';

  const telefono = String(
    u['telefono'] ?? u['celular'] ?? u['phone'] ?? r['telefono'] ?? '—',
  );
  const correo = String(u['correo'] ?? u['email'] ?? r['correo'] ?? r['email'] ?? '—');

  const pq = rec(u['parqueadero']);
  const parqueaderoNombre = String(
    u['parqueaderoNombre'] ??
      pq?.['nombre'] ??
      pq?.['ubicacion'] ??
      r['parqueaderoNombre'] ??
      '',
  ).trim();
  const parqueaderoDesde = String(
    u['parqueaderoDesde'] ??
      pq?.['desde'] ??
      pq?.['fechaAsignacion'] ??
      r['parqueaderoDesde'] ??
      '',
  ).trim();

  return {
    nombre,
    documento,
    tipo,
    telefono,
    correo,
    ...(parqueaderoNombre ? { parqueaderoNombre } : {}),
    ...(parqueaderoDesde ? { parqueaderoDesde } : {}),
  };
}
