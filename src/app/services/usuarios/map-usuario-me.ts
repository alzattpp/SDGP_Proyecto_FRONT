
export interface UsuarioMeVista {
  nombre: string;
  documento: string;
  tipo: string;
  telefono: string;
  correo: string;
  idUsuario?: number;
  idParqueadero?: number;
  parqueaderoNombre?: string;
}

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

function strOrDash(...vals: unknown[]): string {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return '—';
}

function formatRol(rol: string): string {
  const r = rol.trim();
  if (!r) return 'Usuario';
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
}

function extractPayload(raw: unknown): { u: Record<string, unknown>; rol: string } {
  const r = rec(raw) ?? {};
  const data = rec(r['data']);
  if (data) {
    const rol = String(r['rol'] ?? r['role'] ?? data['rol'] ?? data['role'] ?? '');
    return { u: data, rol };
  }
  const nested = rec(r['usuario'] ?? r['user']);
  if (nested) {
    const rol = String(r['rol'] ?? r['role'] ?? nested['rol'] ?? nested['role'] ?? '');
    return { u: nested, rol };
  }
  const rol = String(r['rol'] ?? r['role'] ?? r['tipoUsuario'] ?? r['tipo'] ?? '');
  return { u: r, rol };
}

export function mapUsuarioMe(raw: unknown): UsuarioMeVista {
  const { u, rol } = extractPayload(raw);

  const nombrePartes = [u['nombre'], u['apellido']].filter(
    (x) => x != null && String(x).trim() !== '',
  );
  const nombre =
    (nombrePartes.length ? nombrePartes.map(String).join(' ') : '') ||
    strOrDash(u['nombreCompleto'], u['name'], u['nombre']);

  const documento = strOrDash(
    u['documento'],
    u['cedula'],
    u['numeroDocumento'],
    u['dni'],
  );

  const tipo = rol ? formatRol(rol) : formatRol(String(u['tipoUsuario'] ?? u['tipo'] ?? 'usuario'));

  const telefono = strOrDash(u['telefono'], u['celular'], u['phone']);
  const correo = strOrDash(u['correo'], u['email']);

  const idU = Number(u['idUsuario'] ?? u['id_usuario'] ?? 0);
  const idUsuario = idU > 0 ? idU : undefined;

  const idP = Number(u['idParqueadero'] ?? u['id_parqueadero'] ?? 0);
  const idParqueadero = idP > 0 ? idP : undefined;

  const pq = rec(u['parqueadero']);
  const parqueaderoNombre = String(
    u['parqueaderoNombre'] ??
      pq?.['nombre'] ??
      pq?.['nombreParqueadero'] ??
      pq?.['ubicacion'] ??
      '',
  ).trim();

  return {
    nombre,
    documento,
    tipo,
    telefono,
    correo,
    ...(idUsuario ? { idUsuario } : {}),
    ...(idParqueadero ? { idParqueadero } : {}),
    ...(parqueaderoNombre ? { parqueaderoNombre } : {}),
  };
}
