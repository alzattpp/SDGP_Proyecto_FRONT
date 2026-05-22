import { extractMePayload, rec } from '../../auth/auth-role.util';

function asArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  return [];
}

export function extractNumeroUsosServicio(raw: unknown): number | null {
  const { u } = extractMePayload(raw);
  const r = rec(raw) ?? {};

  const candidatos = [
    r['totalLogins'],
    u['totalLogins'],
    u['cantidadLogins'],
    u['numeroLogins'],
    u['numeroUsos'],
    u['usosServicio'],
    u['contadorLogin'],
    u['contadorLogins'],
    u['vecesLogin'],
    u['cantidadUsos'],
    u['numeroAccesos'],
    r['cantidadLogins'],
    r['numeroLogins'],
    r['contador'],
    r['total'],
    r['count'],
    rec(r['data'])?.['cantidadLogins'],
    rec(r['data'])?.['contador'],
  ];

  for (const v of candidatos) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }

  const lista = asArray(raw);
  if (lista.length > 0 && raw && typeof raw === 'object') {
    const first = lista[0];
    if (first && Object.keys(first).length <= 2 && first['total'] != null) {
      const n = Number(first['total'] ?? first['count'] ?? first['cantidad']);
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
  }

  return null;
}
