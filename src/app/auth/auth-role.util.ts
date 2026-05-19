/** Roles de la aplicación alineados con el JWT / cookie del API. */
export type AppRole = 'usuario' | 'trabajador' | 'administrador';

export function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

/** Extrae `{ data, rol }` de cualquier respuesta /me o login. */
export function extractMePayload(raw: unknown): { u: Record<string, unknown>; rol: string } {
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

/** Normaliza el string de rol del token/API al rol de rutas. */
export function normalizeAppRol(rolRaw: string): AppRole | null {
  const r = rolRaw.trim().toLowerCase();
  if (!r) return 'usuario';
  if (r === 'trabajador' || r.includes('trabajador') || r === 'worker' || r.includes('empleado')) {
    return 'trabajador';
  }
  if (r === 'admin' || r === 'administrador' || r.includes('admin')) {
    return 'administrador';
  }
  if (r === 'usuario' || r === 'user') {
    return 'usuario';
  }
  return null;
}

export function resolveRolFromResponse(raw: unknown): AppRole | null {
  const { rol } = extractMePayload(raw);
  return normalizeAppRol(rol);
}

export function homeRouteForRole(rol: AppRole): string {
  switch (rol) {
    case 'trabajador':
      return '/trabajador';
    case 'administrador':
      return '/admin/perfil';
    default:
      return '/principal';
  }
}

export function loginRouteForRoles(roles: AppRole[]): string {
  return roles.includes('administrador') ? '/admin/login' : '/';
}
