import type { MedioPagoItem } from '../../pages/perfil/perfil';

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

function asArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['mediosPago'])) return r['mediosPago'] as Record<string, unknown>[];
  return [];
}

export function mapMediosPagoLista(raw: unknown): MedioPagoItem[] {
  return asArray(raw)
    .map((x) => {
      const id = Number(x['idMedioPago'] ?? x['id'] ?? 0);
      const tipo = String(x['tipo'] ?? '').trim();
      const detalle = String(
        x['numeroReferencia'] ?? x['numero'] ?? x['referencia'] ?? x['detalle'] ?? '',
      ).trim();
      if (!tipo && !detalle) return null;
      return {
        id: id > 0 ? String(id) : `${tipo}-${detalle}`,
        tipo: tipo || '—',
        detalle: detalle || '—',
      };
    })
    .filter((x): x is MedioPagoItem => x != null);
}
